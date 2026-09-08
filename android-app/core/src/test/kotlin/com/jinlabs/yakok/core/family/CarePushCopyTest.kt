package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.constants.CarePush
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import org.junit.jupiter.api.Test

class CarePushCopyTest {
    @Test
    fun taken_includesNickname() {
        val copy = CarePushCopy.build(CarePushKind.Taken, "엄마")
        assertEquals("약 챙겼어요", copy.title)
        assertEquals("엄마 님이 약을 먹었어요", copy.body)
        assertFalse(copy.body.contains("점수"))
        assertFalse(copy.body.contains("감시"))
    }

    @Test
    fun stuck_fallbackNickname() {
        val copy = CarePushCopy.build(CarePushKind.StuckEscalate, "  ")
        assertEquals("안부가 궁금해요", copy.title)
        assertEquals("가족 님 복약 체크가 멈춘 것 같아요", copy.body)
    }

    @Test
    fun channelIds_matchRn() {
        assertEquals("care-taken", CarePushKind.Taken.channelId)
        assertEquals("care-stuck", CarePushKind.StuckEscalate.channelId)
        assertEquals("announcement", CarePush.ChannelAnnouncement)
    }
}
