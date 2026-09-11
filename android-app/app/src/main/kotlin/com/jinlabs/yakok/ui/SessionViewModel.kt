package com.jinlabs.yakok.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.local.LocalMedStore
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

@HiltViewModel
class SessionViewModel @Inject constructor(
    store: LocalMedStore,
) : ViewModel() {
    val onboardingDone: StateFlow<Boolean?> = store.profile
        .map { it.onboardingDone }
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)
}
