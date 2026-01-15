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
import android.graphics.RectF
import android.widget.RemoteViews
import com.yearprogress.app.MainActivity
import com.yearprogress.app.R
import kotlin.math.cos
import kotlin.math.sin

class OrbitWidget : AppWidgetProvider() {

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

        val views = RemoteViews(context.packageName, R.layout.widget_orbit)
        
        val bitmap = drawOrbit(yearData.percentage)
        views.setImageViewBitmap(R.id.widget_orbit_canvas, bitmap)

        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_orbit_canvas, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun drawOrbit(percentage: Double): Bitmap {
        val size = 500
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        val cx = size / 2f
        val cy = size / 2f
        val radius = size / 2f - 40f
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 4f
        paint.color = Color.parseColor("#333333") // Orbit Path
        
        canvas.drawCircle(cx, cy, radius, paint)
        
        // Calculate Planet Position
        // -90 degrees is top (start)
        val angle = Math.toRadians((percentage / 100.0 * 360.0) - 90.0)
        
        val px = cx + radius * cos(angle).toFloat()
        val py = cy + radius * sin(angle).toFloat()
        
        // Draw Planet
        paint.style = Paint.Style.FILL
        paint.color = Color.parseColor("#CCFF00")
        paint.setShadowLayer(15f, 0f, 0f, paint.color)
        canvas.drawCircle(px, py, 16f, paint)
        
        // Draw Core Sun (optional, minimal dot in center)
        paint.clearShadowLayer()
        paint.color = Color.WHITE
        paint.alpha = 50
        canvas.drawCircle(cx, cy, 4f, paint)

        // Draw Percentage Text in Center
        paint.alpha = 255
        paint.color = Color.WHITE
        paint.textSize = 50f
        paint.textAlign = Paint.Align.CENTER
        paint.typeface = Typeface.MONOSPACE
        
        val text = String.format("%.0f%%", percentage)
        val textOffset = (paint.descent() + paint.ascent()) / 2
        canvas.drawText(text, cx, cy - textOffset, paint)
        
        return bitmap
    }
}
