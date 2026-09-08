package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.copy.Errors

object MedicationMeta {
    fun clampText(value: String?): String = (value ?: "").take(Limits.MedMetaMaxLength)

    fun sanitizeDoseAmountInput(raw: String): String {
        val cleaned = raw.filter { it.isDigit() || it == '.' }
        if (cleaned.isEmpty()) return ""
        val dot = cleaned.indexOf('.')
        val maxIntLen = Limits.MedDoseAmountMax.toString().length
        if (dot < 0) return cleaned.take(maxIntLen)
        val intPart = cleaned.substring(0, dot).take(maxIntLen)
        val fracPart = cleaned.substring(dot + 1).replace(".", "").take(2)
        return "$intPart.$fracPart"
    }

    fun parseDoseAmount(raw: String): Double? {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) return null
        return trimmed.toDoubleOrNull()
    }

    fun validateDosePair(amount: Double?, unit: String?): String? {
        val hasAmount = amount != null && amount.isFinite()
        val hasUnit = !unit.isNullOrBlank()
        if (hasAmount == hasUnit) {
            if (hasAmount && amount!! <= 0) return Errors.Med.DoseInvalid
            return null
        }
        return Errors.Med.DosePairRequired
    }

    fun validateForm(meta: MedicationMetaFormFields): String? {
        val texts = listOf(meta.efficacy, meta.useMethod, meta.storage, meta.warning)
        if (texts.any { it.length > Limits.MedMetaMaxLength }) return Errors.Med.MetaTooLong
        val amount = parseDoseAmount(meta.doseAmount)
        if (amount != null) {
            if (amount <= 0) return Errors.Med.DoseInvalid
            if (amount > Limits.MedDoseAmountMax) return Errors.Med.DoseTooLarge
        }
        return validateDosePair(amount, meta.doseUnit)
    }

    data class MetaColumns(
        val itemSeq: String?,
        val color: String,
        val efficacy: String?,
        val useMethod: String?,
        val storage: String?,
        val warning: String?,
        val doseAmount: Double?,
        val doseUnit: String?,
    )

    fun toColumns(meta: MedicationMetaInput): MetaColumns {
        val normalized = meta.doseAmount?.takeIf { it.isFinite() }
        val doseUnit = meta.doseUnit?.trim()?.takeIf { it.isNotEmpty() }
        if (normalized != null && (normalized <= 0 || normalized > Limits.MedDoseAmountMax)) {
            throw IllegalStateException(
                if (normalized > Limits.MedDoseAmountMax) Errors.Med.DoseTooLarge else Errors.Med.DoseInvalid,
            )
        }
        validateDosePair(normalized, doseUnit)?.let { throw IllegalStateException(it) }
        return MetaColumns(
            itemSeq = meta.itemSeq?.trim()?.takeIf { it.isNotEmpty() },
            color = meta.color?.trim()?.takeIf { it.isNotEmpty() } ?: MedColors.DefaultId,
            efficacy = clampText(meta.efficacy?.trim()).takeIf { it.isNotEmpty() },
            useMethod = clampText(meta.useMethod?.trim()).takeIf { it.isNotEmpty() },
            storage = clampText(meta.storage?.trim()).takeIf { it.isNotEmpty() },
            warning = clampText(meta.warning?.trim()).takeIf { it.isNotEmpty() },
            doseAmount = normalized,
            doseUnit = doseUnit,
        )
    }
}
