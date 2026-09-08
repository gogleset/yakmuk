package com.jinlabs.yakok.core.constants

/** RN `shared/constants/medDoseUnits.ts` · DB medications_dose_unit_chk 동기. */
object MedDoseUnits {
    data class Unit(val id: String, val label: String)

    val All: List<Unit> = listOf(
        Unit("tablet", "정"),
        Unit("capsule", "캡슐"),
        Unit("ml", "ml"),
        Unit("mg", "mg"),
        Unit("g", "g"),
        Unit("packet", "포"),
        Unit("drop", "방울"),
        Unit("patch", "매"),
        Unit("spoon", "스푼"),
    )

    private val ids = All.map { it.id }.toSet()

    fun isMedDoseUnitId(value: String): Boolean = value in ids

    fun label(unitId: String): String = All.find { it.id == unitId }?.label ?: unitId

    fun formatDose(amount: Double?, unitId: String?): String? {
        if (amount == null || unitId == null) return null
        val amountText = if (amount == amount.toLong().toDouble()) {
            amount.toLong().toString()
        } else {
            amount.toString()
        }
        return "$amountText${label(unitId)}"
    }
}
