package com.yearprogress.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.widget.RemoteViews
import com.yearprogress.app.MainActivity
import com.yearprogress.app.R

class EntropyWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val userState = WidgetHelper.getUserState(context)
        val yearData = WidgetHelper.getYearData(userState.birthDate)

        val views = RemoteViews(context.packageName, R.layout.widget_entropy)
        
        // Generate Bitmap
        val bitmap = drawEntropyGrid(yearData.totalDays, yearData.daysPassed)
        views.setImageViewBitmap(R.id.widget_entropy_canvas, bitmap)

        // Launch App on Click
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_entropy_canvas, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun drawEntropyGrid(totalDays: Int, daysPassed: Int): Bitmap {
        val width = 800
        val height = 800
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val cols = 19 // Roughly sqrt(365) is 19.1
        val rows = 20
        
        val margin = 40f
        val availableWidth = width - (margin * 2)
        val availableHeight = height - (margin * 2)
        
        val gap = 12f
        val dotSize = (availableWidth - (gap * (cols - 1))) / cols
        val radius = dotSize / 2f
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        
        // Colors
        val acidGreen = Color.parseColor("#CCFF00")
        val dimGray = Color.parseColor("#444444") // Lighter gray for outline visibility

        for (i in 0 until totalDays) {
            val col = i % cols
            val row = i / cols
            
            val cx = margin + col * (dotSize + gap) + radius
            val cy = margin + row * (dotSize + gap) + radius
            
            if (i < daysPassed) {
                // Past: Filled Light Circle
                paint.style = Paint.Style.FILL
                paint.color = acidGreen
                paint.setShadowLayer(8f, 0f, 0f, acidGreen)
                canvas.drawCircle(cx, cy, radius, paint)
            } else {
                // Future: Outlined Circle
                paint.style = Paint.Style.STROKE
                paint.strokeWidth = 3f
                paint.color = dimGray
                paint.clearShadowLayer()
                // Adjust radius slightly for stroke to be inside/centered
                canvas.drawCircle(cx, cy, radius - 1.5f, paint)
            }
        }
        
        return bitmap
    }
}
