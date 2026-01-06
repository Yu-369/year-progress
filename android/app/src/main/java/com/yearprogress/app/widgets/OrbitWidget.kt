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
import android.graphics.RectF
import android.graphics.SweepGradient
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
        val radius = size / 2f - 50f
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 6f
        
        // Gradient Ring
        // Rotate -90 degrees so start is at top
        val colors = intArrayOf(
            Color.parseColor("#111111"), // Start dark
            Color.parseColor("#CCFF00")  // End at Acid Green
        )
        val positions = floatArrayOf(0f, 1f)
        val shader = SweepGradient(cx, cy, colors, positions)
        
        // Matrix to rotate gradient to align with progress? 
        // Simpler: Just draw a static subtle ring + progress arc
        
        // 1. Background Track
        paint.shader = null
        paint.color = Color.parseColor("#222222")
        canvas.drawCircle(cx, cy, radius, paint)
        
        // 2. Progress Arc involves SweepGradient rotation which is tricky in raw Canvas without Matrix.
        // Let's keep it clean: A simple progress Arc for "Past"
        paint.color = Color.parseColor("#CCFF00")
        paint.alpha = 100
        val rect = RectF(cx - radius, cy - radius, cx + radius, cy + radius)
        // -90 is top.
        val sweepAngle = (percentage / 100.0 * 360.0).toFloat()
        canvas.drawArc(rect, -90f, sweepAngle, false, paint)
        
        
        // Calculate Planet Position
        val angleRad = Math.toRadians((percentage / 100.0 * 360.0) - 90.0)
        
        val px = cx + radius * cos(angleRad).toFloat()
        val py = cy + radius * sin(angleRad).toFloat()
        
        // Draw Planet Glow
        paint.style = Paint.Style.FILL
        paint.color = Color.parseColor("#CCFF00")
        paint.alpha = 50
        canvas.drawCircle(px, py, 25f, paint) // Outer Glow
        
        // Draw Planet Core
        paint.alpha = 255
        paint.setShadowLayer(15f, 0f, 0f, Color.parseColor("#CCFF00"))
        canvas.drawCircle(px, py, 12f, paint)
        
        return bitmap
    }
}
