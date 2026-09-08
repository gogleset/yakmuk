package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.DayCompleteFeed
import com.jinlabs.yakok.core.med.LogStatus
import com.jinlabs.yakok.core.time.Format
import com.jinlabs.yakok.core.time.Kst

object FamilyFeed {
    /** 오늘 포함 windowDays일 이내만 (logDate 기준) */
    fun filterLastDays(
        items: List<DailyLog>,
        todayYmd: String,
        windowDays: Int,
    ): List<DailyLog> {
        val days = maxOf(1, windowDays)
        val sinceYmd = Kst.addDays(todayYmd, -(days - 1))
        return items.filter { it.logDate >= sinceYmd && it.logDate <= todayYmd }
    }

    /** 최신일 먼저 · 날짜별 그룹 */
    fun groupByDate(items: List<DailyLog>, todayYmd: String): List<FamilyFeedSection> {
        val byDate = linkedMapOf<String, MutableList<DailyLog>>()
        for (item in items) {
            byDate.getOrPut(item.logDate) { mutableListOf() }.add(item)
        }
        return byDate.entries
            .sortedByDescending { it.key }
            .map { (dateYmd, data) ->
                FamilyFeedSection(
                    dateYmd = dateYmd,
                    title = Format.feedDayHeading(dateYmd, todayYmd),
                    data = data,
                )
            }
    }

    /** 그룹 유지하며 앞에서부터 previewCount개만 */
    fun sliceSections(
        sections: List<FamilyFeedSection>,
        previewCount: Int,
    ): List<FamilyFeedSection> {
        var remaining = maxOf(0, previewCount)
        val out = mutableListOf<FamilyFeedSection>()
        for (section in sections) {
            if (remaining <= 0) break
            val data = section.data.take(remaining)
            remaining -= data.size
            if (data.isNotEmpty()) {
                out.add(section.copy(data = data))
            }
        }
        return out
    }

    fun itemTitle(item: DailyLog): String {
        val who = item.nickname?.trim()?.takeIf { it.isNotEmpty() } ?: Copy.Family.MemberFallback
        if (DayCompleteFeed.isFeedLog(item)) return Copy.Family.feedAllTaken(who)
        if (item.status == LogStatus.Taken) return Copy.Family.feedTaken(who)
        val condition = item.condition ?: return Copy.Family.feedFallback(who)
        val label = when (condition) {
            ConditionValue.Good -> Copy.Family.ConditionFeedGood
            ConditionValue.Normal -> Copy.Family.ConditionFeedNormal
            ConditionValue.Bad -> Copy.Family.ConditionFeedBad
        }
        return Copy.Family.feedCondition(who, label)
    }

    fun itemSubtitle(item: DailyLog): String? {
        if (DayCompleteFeed.isFeedLog(item)) return null
        if (item.status == LogStatus.Taken) return item.medicationName
        return item.message
    }
}
