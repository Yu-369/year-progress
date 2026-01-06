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
import android.graphics.Typeface
import android.widget.RemoteViews
import com.yearprogress.app.MainActivity
import com.yearprogress.app.R
import java.util.Locale

class PulseWidget : AppWidgetProvider() {

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

        val views = RemoteViews(context.packageName, R.layout.widget_pulse)
        
        // Use 2 decimal places as requested
        val text = String.format(Locale.getDefault(), "%.2f%%", yearData.percentage)
        
        // Draw Text as Bitmap to ensure Font Consistency
        val bitmap = drawText(text)
        views.setImageViewBitmap(R.id.widget_pulse_text, bitmap)

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_pulse_text, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
    
    // Draw text to bitmap to simulate "Space Grotesk" or Monospace look
    // since we can't easily use custom fonts in RemoteViews without API 26+ specific calls or complications.
    // Using Typeface.MONOSPACE is the safest bet for the "Data Art" look.
    private fun drawText(text: String): Bitmap {
        val width = 800
        val height = 200 // 4x1 ratio roughly
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = Color.parseColor("#E5E7EB") // gray-200
        paint.textSize = 140f
        paint.typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
        paint.textAlign = Paint.Align.CENTER
        
        // Centering vertically
        val xPos = width / 2f
        val yPos = (height / 2f) - ((paint.descent() + paint.ascent()) / 2f)
        
        // Add subtle shadow/glow
        paint.setShadowLayer(10f, 0f, 0f, Color.parseColor("#CCFF00"))
        
        canvas.drawText(text, xPos, yPos, paint)
        
        return bitmap
    }
}
