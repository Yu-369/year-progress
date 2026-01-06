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
import java.util.Calendar

class GhostWidget : AppWidgetProvider() {

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
        // Sync Logic: Ensure we are calculating weeks based on BirthDate
        val weeksLived = getWeeksLived(userState.birthDate)

        val views = RemoteViews(context.packageName, R.layout.widget_ghost)
        
        val bitmap = drawGhostGrid(weeksLived)
        views.setImageViewBitmap(R.id.widget_ghost_canvas, bitmap)

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_ghost_canvas, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun getWeeksLived(birthDateMillis: Long): Int {
        val now = System.currentTimeMillis()
        val diff = now - birthDateMillis
        return (diff / (1000L * 60 * 60 * 24 * 7)).toInt()
    }

    private fun drawGhostGrid(weeksLived: Int): Bitmap {
        val width = 800
        val height = 800
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // 80 Years * 52 Weeks = 4160 weeks.
        // Grid: 52 columns, 80 rows.
        val cols = 52
        val rows = 80
        val totalWeeks = cols * rows
        
        // Calculate Size to Fit
        // We want some margin
        val margin = 50f // Initial guess
        val availableW = width - (margin * 2)
        val availableH = height - (margin * 2)
        
        // Determine square size based on Width constraint (usually tighter for 52 cols)
        // gap = 2f
        val gap = 4f
        val squareSize = (availableW - (gap * (cols - 1))) / cols
        
        // Re-calculate margins to CENTER EXACTLY
        val contentWidth = cols * squareSize + (cols - 1) * gap
        val contentHeight = rows * squareSize + (rows - 1) * gap
        
        val startX = (width - contentWidth) / 2f
        val startY = (height - contentHeight) / 2f
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        val livedColor = Color.parseColor("#444444") // Dim Gray for lived
        val futureColor = Color.parseColor("#1A1A1A")     // Very dark for future
        val currentColor = Color.parseColor("#CCFF00") // Acid Green for current week

        for (i in 0 until totalWeeks) {
            val col = i % cols
            val row = i / cols
            
            val left = startX + col * (squareSize + gap)
            val top = startY + row * (squareSize + gap)
            val right = left + squareSize
            val bottom = top + squareSize
            
            if (i < weeksLived) {
                paint.color = livedColor
            } else if (i == weeksLived) {
                paint.color = currentColor
                // optional glow for current week
                paint.setShadowLayer(5f, 0f, 0f, currentColor)
            } else {
                paint.color = futureColor
                paint.clearShadowLayer()
            }
            
            canvas.drawRect(left, top, right, bottom, paint)
            // clear shadow after drawing current
             if (i == weeksLived) paint.clearShadowLayer()
        }

        return bitmap
    }
}
