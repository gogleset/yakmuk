package com.jinlabs.yakok.core.family

object FeedUnread {
    /** 일자 unread — 읽음 없거나, 그날 최신 로그가 read_at 이후면 미읽. */
    fun isDayUnread(readAt: String?, latestCreatedAt: String?): Boolean {
        if (latestCreatedAt.isNullOrEmpty()) return false
        if (readAt.isNullOrEmpty()) return true
        return latestCreatedAt > readAt
    }

    fun latestCreatedAtByDate(
        items: List<Pair<String, String>>,
    ): Map<String, String> {
        val map = linkedMapOf<String, String>()
        for ((logDate, createdAt) in items) {
            val prev = map[logDate]
            if (prev == null || createdAt > prev) map[logDate] = createdAt
        }
        return map
    }

    fun readsByDate(reads: List<FamilyFeedDayRead>): Map<String, String> =
        reads.associate { it.logDate to it.readAt }

    fun hasUnreadDays(
        sections: List<FamilyFeedSection>,
        readsByDate: Map<String, String>,
    ): Boolean {
        for (section in sections) {
            if (section.data.isEmpty()) continue
            val latest = section.data.maxOf { it.createdAt }
            if (isDayUnread(readsByDate[section.dateYmd], latest)) return true
        }
        return false
    }

    fun isSectionUnread(
        dateYmd: String,
        data: List<Pair<String, String>>,
        readsByDate: Map<String, String>,
    ): Boolean {
        if (data.isEmpty()) return false
        val latest = data.maxOf { it.second }
        return isDayUnread(readsByDate[dateYmd], latest)
    }
}
