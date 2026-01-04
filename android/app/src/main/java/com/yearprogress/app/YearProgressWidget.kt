package com.yearprogress.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.util.Calendar

/**
 * Year Progress Widget Provider
 * Displays current year progress percentage on the home screen
 */
class YearProgressWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update each widget instance
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        // Handle manual refresh clicks
        if (intent.action == ACTION_REFRESH) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, YearProgressWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.yearprogress.app.WIDGET_REFRESH"

        private fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout)

            // Calculate year progress
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val dayOfYear = calendar.get(Calendar.DAY_OF_YEAR)
            
            // Get total days in year (accounting for leap years)
            val isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
            val totalDays = if (isLeapYear) 366 else 365
            
            // Calculate precise percentage with time of day
            val hourOfDay = calendar.get(Calendar.HOUR_OF_DAY)
            val minute = calendar.get(Calendar.MINUTE)
            val dayFraction = (hourOfDay * 60 + minute) / (24.0 * 60.0)
            val exactDays = dayOfYear - 1 + dayFraction
            val percentage = (exactDays / totalDays) * 100.0
            
            // Format display values
            val percentageText = String.format("%.2f%%", percentage)
            val daysLeft = totalDays - dayOfYear
            val daysLeftText = "$daysLeft days left"

            // Update widget views
            views.setTextViewText(R.id.widget_percentage, percentageText)
            views.setTextViewText(R.id.widget_days_left, daysLeftText)
            views.setTextViewText(R.id.widget_year, year.toString())

            // Set up click to open app
            val openAppIntent = Intent(context, MainActivity::class.java)
            val openAppPendingIntent = PendingIntent.getActivity(
                context,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, openAppPendingIntent)

            // Set up refresh button click
            val refreshIntent = Intent(context, YearProgressWidget::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                1,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent)

            // Push update to widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
