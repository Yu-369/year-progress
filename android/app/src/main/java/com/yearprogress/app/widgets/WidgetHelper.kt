package com.yearprogress.app.widgets

import android.content.Context
import android.content.SharedPreferences
import java.util.Calendar
import java.util.Date
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.TimeZone
import java.util.Locale

object WidgetHelper {

    private const val PREFS_NAME = "CapacitorStorage"

    data class UserState(
        val birthDate: Long,
        val gender: String,
        val logs: Map<String, Any> // Simplified for now
    )

    fun getUserState(context: Context): UserState {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        
        // Capacitor Preferences stores strings.
        // We stored ISO strings: "2000-01-01T00:00:00.000Z"
        val birthDateStr = prefs.getString("birthDate", null)
        val gender = prefs.getString("gender", "MALE") ?: "MALE"
        
        var birthTime = 946684800000L // Default 2000-01-01
        
        if (birthDateStr != null) {
            try {
                // Safe ISO parsing
                val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                format.timeZone = TimeZone.getTimeZone("UTC")
                val date = format.parse(birthDateStr)
                if (date != null) {
                    birthTime = date.time
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        return UserState(birthTime, gender, emptyMap())
    }

    fun getYearData(birthDate: Long): YearData {
        val now = Calendar.getInstance()
        val currentYear = now.get(Calendar.YEAR)
        
        val start = Calendar.getInstance()
        start.set(currentYear, Calendar.JANUARY, 1, 0, 0, 0)
        start.set(Calendar.MILLISECOND, 0)
        
        val end = Calendar.getInstance()
        end.set(currentYear + 1, Calendar.JANUARY, 1, 0, 0, 0)
        end.set(Calendar.MILLISECOND, 0)
        
        val nowTime = now.timeInMillis
        val startTime = start.timeInMillis
        val endTime = end.timeInMillis
        
        val totalDays = if (isLeap(currentYear)) 366 else 365
        val daysPassed = now.get(Calendar.DAY_OF_YEAR)
        
        val percent = (nowTime - startTime).toDouble() / (endTime - startTime).toDouble() * 100
        
        return YearData(
            year = currentYear,
            daysPassed = daysPassed,
            totalDays = totalDays,
            percentage = percent,
            birthDate = birthDate
        )
    }

    private fun isLeap(year: Int): Boolean {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
    }

    data class YearData(
        val year: Int,
        val daysPassed: Int,
        val totalDays: Int,
        val percentage: Double,
        val birthDate: Long
    )
}
