package com.yearprogress.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.yearprogress.app.MainActivity
import com.yearprogress.app.R

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
        
        // Use Bitmap for custom font rendering
        val bitmap = drawPulseText(context, yearData.percentage)
        views.setImageViewBitmap(R.id.widget_pulse_canvas, bitmap)

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_pulse_canvas, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun drawPulseText(context: Context, percentage: Double): Bitmap {
        val width = 800
        val height = 200
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = Color.WHITE
        paint.textSize = 90f
        paint.textAlign = Paint.Align.CENTER
        
        // Try to load custom font, fallback to standard
        try {
            val typeface = Typeface.createFromAsset(context.assets, "public/fonts/SpaceGrotesk-Variable.woff2")
            paint.typeface = typeface
        } catch (e: Exception) {
            paint.typeface = Typeface.MONOSPACE
        }

        val cx = width / 2f
        val cy = height / 2f
        
        // Draws: 12.45%
        // Two decimal places as requested
        val text = String.format("%.2f%%", percentage)
        
        // Draw Main Text
        // Center vertically: descent + ascent is height of font
        val offset = (paint.descent() + paint.ascent()) / 2
        canvas.drawText(text, cx, cy - offset - 20f, paint)

        // Draw Label
        paint.textSize = 30f
        paint.color = Color.parseColor("#66FFFFFF")
        paint.typeface = Typeface.MONOSPACE
        paint.letterSpacing = 0.2f
        canvas.drawText("YEAR COMPLETED", cx, cy + 60f, paint)

        return bitmap
    }
}
