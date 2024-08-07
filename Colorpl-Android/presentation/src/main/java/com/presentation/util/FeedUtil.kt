package com.presentation.util

import android.content.Context
import androidx.recyclerview.widget.RecyclerView
import com.domain.model.FilterItem

fun Context.getFilterItems(): List<FilterItem> {
    return FilterType.entries.toTypedArray().mapIndexed { index, type ->
        FilterItem(type.getText(this), index == 0)
    }
}