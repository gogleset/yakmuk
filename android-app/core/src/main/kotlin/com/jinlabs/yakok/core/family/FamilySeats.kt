package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.UserRole

object FamilySeats {
    /**
     * 자리표 — 리더 제외 멤버 → 미클레임 초대 → empty.
     * claimed 초대는 멤버 칸 `inviteId`로만 연결 — 리더 메뉴「초대장 새로 주기」대상.
     */
    fun build(
        members: List<FamilyMember>,
        invites: List<FamilyInvite>,
        maxSeats: Int,
    ): List<FamilySeat> {
        val others = members.filter { it.role != UserRole.FamilyLeader }
        val claimedByUser = invites
            .filter { it.claimedBy != null }
            .associateBy { it.claimedBy!! }

        val memberSeats = others.map { m ->
            FamilySeat.Member(
                userId = m.userId,
                nickname = m.nickname,
                invitedAs = m.invitedAs,
                role = m.role,
                inviteId = claimedByUser[m.userId]?.id,
            )
        }
        val pendingSeats = invites.filter { it.claimedBy == null }.map { inv ->
            FamilySeat.Pending(
                invite = inv,
                pendingKind = if (inv.reentryUserId != null) {
                    FamilySeatPendingKind.Reentry
                } else {
                    FamilySeatPendingKind.Waiting
                },
            )
        }
        val occupied = (memberSeats + pendingSeats).take(maxSeats)
        val emptyCount = maxOf(0, maxSeats - occupied.size)
        return occupied + List(emptyCount) { FamilySeat.Empty }
    }
}
