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
        
        val views = RemoteViews(context.packageName, R.layout.widget_ghost)
        
        val bitmap = drawLifeGrid(userState.birthDate)
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

    private fun drawLifeGrid(birthDate: Long): Bitmap {
        val width = 800
        val height = 800
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // 80 years * 52 weeks = 4160 dots.
        // Grid: 52 columns (weeks), 80 rows (years).
        val cols = 52
        val rows = 80
        
        val margin = 20f
        val availableWidth = width - (margin * 2)
        val availableHeight = height - (margin * 2)
        
        // Calculate gap and dot size.
        // Since we have many rows, dots must be small.
        val gap = 4f
        val dotWidth = (availableWidth - (gap * (cols - 1))) / cols
        val dotHeight = (availableHeight - (gap * (rows - 1))) / rows
        
        // Use the smaller dimension to keep aspect ratio square-ish if desired,
        // or stretch. Let's strictly calculate based on available space.
        // dots will likely be rectangular if we don't constrain.
        // Let's force them to be square by taking min.
        val size = minOf(dotWidth, dotHeight)
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        val acidGreen = Color.parseColor("#CCFF00")
        val dimGray = Color.parseColor("#1A1A1A") // Very dark for future
        val livedColor = Color.parseColor("#444444") // Lived weeks

        // Calculate weeks passed
        val now = System.currentTimeMillis()
        val diff = now - birthDate
        val weeksPassed = (diff / (1000L * 60 * 60 * 24 * 7)).toInt()
        val totalWeeks = rows * cols

        // CENTERING LOGIC
        val gridWidth = cols * size + (cols - 1) * gap
        val gridHeight = rows * size + (rows - 1) * gap

        val offsetX = (width - gridWidth) / 2f
        val offsetY = (height - gridHeight) / 2f

        for (i in 0 until totalWeeks) {
            val col = i % cols
            val row = i / cols
            
            val cx = offsetX + col * (size + gap)
            val cy = offsetY + row * (size + gap)
            
            if (i < weeksPassed) {
                paint.color = livedColor
                if (i > weeksPassed - 2) { // Current week highlight
                     paint.color = acidGreen
                     paint.setShadowLayer(8f, 0f, 0f, acidGreen)
                } else {
                     paint.clearShadowLayer()
                }
            } else {
                paint.color = dimGray
                paint.clearShadowLayer()
            }
            
            canvas.drawRect(cx, cy, cx + size, cy + size, paint)
        }
        
        return bitmap
    }
    
    private fun minOf(a: Float, b: Float): Float {
        return if (a < b) a else b
    }
}
