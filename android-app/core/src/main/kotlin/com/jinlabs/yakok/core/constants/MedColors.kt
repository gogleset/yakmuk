package com.jinlabs.yakok.core.constants

/** RN `shared/constants/medColors.ts` */
object MedColors {
    const val DefaultId = "teal"
    const val SoftAlpha = 0.2f

    data class Swatch(val id: String, val hex: String)

    val All: List<Swatch> = listOf(
        Swatch("teal", "#4D8679"),
        Swatch("mint", "#6BA89A"),
        Swatch("sky", "#6B9BB5"),
        Swatch("lilac", "#8B7BA8"),
        Swatch("coral", "#C46B5A"),
        Swatch("amber", "#C49A3C"),
        Swatch("rose", "#C47A8A"),
        Swatch("slate", "#7A8783"),
    )

    private val ids = All.map { it.id }.toSet()

    fun isMedColorId(value: String): Boolean = value in ids

    fun resolveHex(colorId: String): String =
        All.find { it.id == colorId }?.hex ?: All.first().hex

    fun softFill(colorId: String, alpha: Float = SoftAlpha): String {
        val hex = resolveHex(colorId).trim().removePrefix("#")
        if (hex.length != 6) return "rgba(77, 134, 121, $alpha)"
        val r = hex.substring(0, 2).toInt(16)
        val g = hex.substring(2, 4).toInt(16)
        val b = hex.substring(4, 6).toInt(16)
        val a = alpha.coerceIn(0f, 1f)
        val aStr = if (a == a.toInt().toFloat()) a.toInt().toString() else a.toString()
        return "rgba($r, $g, $b, $aStr)"
    }
}
