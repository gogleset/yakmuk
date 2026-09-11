package com.jinlabs.yakok.core.med

enum class MedPurpose {
    Bp,
    Diabetes,
    Heart,
    Gi,
    Pain,
    Other,
    Unknown,
    ;

    val wire: String
        get() = when (this) {
            Bp -> "bp"
            Diabetes -> "diabetes"
            Heart -> "heart"
            Gi -> "gi"
            Pain -> "pain"
            Other -> "other"
            Unknown -> "unknown"
        }

    companion object {
        fun fromWire(raw: String?): MedPurpose? = when (raw) {
            "bp" -> Bp
            "diabetes" -> Diabetes
            "heart" -> Heart
            "gi" -> Gi
            "pain" -> Pain
            "other" -> Other
            "unknown" -> Unknown
            else -> null
        }
    }
}

enum class Discomfort {
    Head,
    Chest,
    Belly,
    Joint,
    None,
    ;

    val wire: String
        get() = when (this) {
            Head -> "head"
            Chest -> "chest"
            Belly -> "belly"
            Joint -> "joint"
            None -> "none"
        }

    companion object {
        fun fromWire(raw: String?): Discomfort? = when (raw) {
            "head" -> Head
            "chest" -> Chest
            "belly" -> Belly
            "joint" -> Joint
            "none" -> None
            else -> null
        }
    }
}
