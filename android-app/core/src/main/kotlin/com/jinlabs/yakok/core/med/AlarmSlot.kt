package com.jinlabs.yakok.core.med

data class AlarmMedItem(
    val medicationId: Long,
    val name: String,
    val scheduledTime: String,
    val useMethod: String?,
    val doseAmount: Double?,
    val doseUnit: String?,
)

data class AlarmSlot(
    val scheduledTime: String,
    val items: List<AlarmMedItem>,
)

object AlarmSlotResolver {
    fun toItem(med: Medication): AlarmMedItem = AlarmMedItem(
        medicationId = med.id,
        name = med.name,
        scheduledTime = med.scheduledTime,
        useMethod = med.useMethod,
        doseAmount = med.doseAmount,
        doseUnit = med.doseUnit,
    )

    fun medsAtScheduledTime(
        medications: List<Medication>,
        scheduledTime: String,
    ): List<AlarmMedItem> {
        val time = scheduledTime.trim()
        if (time.isEmpty()) return emptyList()
        return medications
            .filter { it.scheduledTime == time }
            .sortedBy { it.id }
            .map { toItem(it) }
    }

    fun pendingMedsAtScheduledTime(
        medications: List<Medication>,
        takenIds: Set<Long>,
        scheduledTime: String,
    ): List<AlarmMedItem> =
        medsAtScheduledTime(medications, scheduledTime)
            .filter { it.medicationId !in takenIds }

    fun resolve(
        medications: List<Medication>,
        scheduledTime: String? = null,
        preferMulti: Boolean = false,
    ): AlarmSlot? {
        val wanted = scheduledTime?.trim().orEmpty()
        if (wanted.isNotEmpty()) {
            val items = medsAtScheduledTime(medications, wanted)
            if (items.isEmpty()) return null
            return AlarmSlot(wanted, items)
        }
        val groups = TimeSlots.groupMedsByScheduledTime(medications)
        if (groups.isEmpty()) return null
        var best = groups.first()
        for (group in groups.drop(1)) {
            if (preferMulti) {
                val more = group.meds.size > best.meds.size
                val tieEarlier = group.meds.size == best.meds.size &&
                    TimeSlots.parseTimeToMinutes(group.scheduledTime) <
                    TimeSlots.parseTimeToMinutes(best.scheduledTime)
                if (more || tieEarlier) best = group
            } else if (
                TimeSlots.parseTimeToMinutes(group.scheduledTime) <
                TimeSlots.parseTimeToMinutes(best.scheduledTime)
            ) {
                best = group
            }
        }
        return AlarmSlot(
            scheduledTime = best.scheduledTime,
            items = best.meds.sortedBy { it.id }.map { toItem(it) },
        )
    }
}
