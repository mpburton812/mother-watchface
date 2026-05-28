package com.mpburton812.motherwatchface.companion

import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var tvTerminalLog: TextView
    private lateinit var btnDiagnostic: Button
    private lateinit var btnLaunchWatch: Button

    private val handler = Handler(Looper.getMainLooper())
    private var isCursorVisible = true
    private var isTyping = false

    private val bootLines = listOf(
        "WEYLAND-YUTANI CORP. // MEMORY SYSTEM ACCESS",
        "MU-TH-UR 6000 SYSTEM ENGINE V9.6.1-A",
        "----------------------------------------",
        "INITIALIZING SECURE LINK COMPANION...",
        "CONNECTING TO PIXEL WATCH MAIN ENGINE... [OK]",
        "ESTABLISHING SECURE MEMORY CHANNELS... [OK]",
        "CHECKING CONFIGURATION REGISTERS...",
        "  [THEME COLOR] REGISTER: COMPLIANT",
        "  [CRT SCANLINE] CONTROLLER: BATTERY_OPTIMIZED",
        "  [FLASHING COLON] COMPONENT: OPERATIONAL",
        "----------------------------------------",
        "SUITE STATUS: SECURE TELEMETRY LINK ONLINE",
        "AWAITING INPUT COMMAND_LINE..."
    )

    private val diagnosticLines = listOf(
        "CLEARING SYSTEM SCREEN BUFFER...",
        "INITIATING CRITICAL SECTOR MEMORY AUDIT...",
        "  SECTOR 0x00FF8E - PARITY VERIFIED [OK]",
        "  SECTOR 0x00FFA2 - RETRO PHOSPHOR ACCEL [OK]",
        "  SECTOR 0x00FFBC - CRT GLOW INTEGRITY [OK]",
        "PINGING SMARTWATCH TELEMETRY...",
        "  WATCH COMPONENT STATUS: ACTIVE",
        "  BATTERY PROBE: STABLE (REPORTED)",
        "  STEP TELEMETRY SENSORS: ONLINE",
        "AUDIT SUCCESS: ZERO SECTOR ANOMALIES DETECTED",
        "Weyland-Yutani: \"Building Better Worlds\"",
        "AWAITING INPUT COMMAND_LINE..."
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tvTerminalLog = findViewById(R.id.tv_terminal_log)
        btnDiagnostic = findViewById(R.id.btn_diagnostic)
        btnLaunchWatch = findViewById(R.id.btn_launch_watch)

        // Start Cursor Blinking
        startCursorBlink()

        // Start Auto-Type Boot Sequence
        runTypewriterSequence(bootLines)

        // Diagnostic Action
        btnDiagnostic.setOnClickListener {
            if (!isTyping) {
                runTypewriterSequence(diagnosticLines)
            }
        }

        // Launch Smartwatch Manager
        btnLaunchWatch.setOnClickListener {
            launchSmartwatchManager()
        }
    }

    private fun startCursorBlink() {
        val cursorRunnable = object : Runnable {
            override fun run() {
                isCursorVisible = !isCursorVisible
                updateTerminalDisplay()
                handler.postDelayed(this, 500)
            }
        }
        handler.post(cursorRunnable)
    }

    private var typedContent = ""
    private fun updateTerminalDisplay() {
        val cursor = if (isCursorVisible) "█" else " "
        tvTerminalLog.text = "$typedContent$cursor"
    }

    private fun runTypewriterSequence(lines: List<String>) {
        isTyping = true
        typedContent = ""
        tvTerminalLog.text = ""
        btnDiagnostic.isEnabled = false

        var lineIndex = 0
        var charIndex = 0
        val delayBetweenChars = 20L
        val delayBetweenLines = 150L

        val typingRunnable = object : Runnable {
            override fun run() {
                if (lineIndex < lines.size) {
                    val currentLine = lines[lineIndex]
                    if (charIndex < currentLine.length) {
                        typedContent += currentLine[charIndex]
                        charIndex++
                        updateTerminalDisplay()
                        handler.postDelayed(this, delayBetweenChars)
                    } else {
                        typedContent += "\n"
                        lineIndex++
                        charIndex = 0
                        updateTerminalDisplay()
                        handler.postDelayed(this, delayBetweenLines)
                    }
                } else {
                    isTyping = false
                    btnDiagnostic.isEnabled = true
                }
            }
        }
        handler.post(typingRunnable)
    }

    private fun launchSmartwatchManager() {
        try {
            // Try standard Pixel Watch companion package first
            val intent = packageManager.getLaunchIntentForPackage("com.google.android.apps.wear.companion")
                ?: packageManager.getLaunchIntentForPackage("com.google.android.wearable.app")
                ?: Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_LAUNCHER)
                    component = ComponentName("com.google.android.apps.wear.companion", "com.google.android.apps.wear.companion.main.MainActivity")
                }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Opening Watch Settings... Select MU-TH-UR in your watch face library.", Toast.LENGTH_LONG).show()
            try {
                // Fallback to wallpaper/face picker setting
                startActivity(Intent("android.intent.action.SET_WALLPAPER"))
            } catch (ex: Exception) {
                // Fallback to opening Pixel Watch Companion app on Play Store
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.apps.wear.companion")))
                } catch (e3: Exception) {
                    Toast.makeText(this, "Could not open smartwatch manager. Long-press your watch face to customize.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
