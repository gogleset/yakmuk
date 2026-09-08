package com.jinlabs.yakok.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.prefs.StartTab
import com.jinlabs.yakok.core.prefs.StartTabs
import com.jinlabs.yakok.data.PrefsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

@HiltViewModel
class TabsViewModel @Inject constructor(
    prefs: PrefsRepository,
) : ViewModel() {
    val startTab: StateFlow<StartTab> = prefs.startTab.stateIn(
        viewModelScope,
        SharingStarted.Eagerly,
        StartTabs.Default,
    )
}
