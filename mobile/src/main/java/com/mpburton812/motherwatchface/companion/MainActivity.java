package com.mpburton812.motherwatchface.companion;

import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private TextView tvTerminalLog;
    private Button btnDiagnostic;
    private Button btnLaunchWatch;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean isCursorVisible = true;
    private boolean isTyping = false;
    private String typedContent = "";

    private final List<String> bootLines = Arrays.asList(
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
    );

    private final List<String> diagnosticLines = Arrays.asList(
        "CLEARING SYSTEM SCREEN BUFFER...",
        "INITIATING CRITICAL SECTOR MEMORY AUDIT...",
        "  SECTOR 0x00FF8E - PARITY VERIFIED [OK]",
        "  SECTOR 0x00FFA2 - RETRO PHOSPHOR ACCEL [OK]",
        "  SECTOR 0x00FFBC - CRT GLOW INTEGRITY [OK]",
        "PINGING SMARTWATCH TELEMETRY...",
        "  WATCH COMPONENT STATUS: ACTIVE",
        "  BATTERY PROBE: STABLE (REPORTED)",
        "  STEP TELEMETRY SENSORS: ONLINE",
        "AUDIT SUCCESS: ZERO SECTOR ANOMALIES DETECTED [OK]",
        "Weyland-Yutani: \"Building Better Worlds\"",
        "AWAITING INPUT COMMAND_LINE..."
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        tvTerminalLog = findViewById(R.id.tv_terminal_log);
        btnDiagnostic = findViewById(R.id.btn_diagnostic);
        btnLaunchWatch = findViewById(R.id.btn_launch_watch);

        // Start Cursor Blinking
        startCursorBlink();

        // Start Auto-Type Boot Sequence
        runTypewriterSequence(bootLines);

        // Diagnostic Action
        btnDiagnostic.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isTyping) {
                    runTypewriterSequence(diagnosticLines);
                }
            }
        });

        // Launch Smartwatch Manager
        btnLaunchWatch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                launchSmartwatchManager();
            }
        });
    }

    private void startCursorBlink() {
        Runnable cursorRunnable = new Runnable() {
            @Override
            public void run() {
                isCursorVisible = !isCursorVisible;
                updateTerminalDisplay();
                handler.postDelayed(this, 500);
            }
        };
        handler.post(cursorRunnable);
    }

    private void updateTerminalDisplay() {
        String cursor = isCursorVisible ? "█" : " ";
        tvTerminalLog.setText(typedContent + cursor);
    }

    private void runTypewriterSequence(final List<String> lines) {
        isTyping = true;
        typedContent = "";
        tvTerminalLog.setText("");
        btnDiagnostic.setEnabled(false);

        final int delayBetweenChars = 20;
        final int delayBetweenLines = 150;

        Runnable typingRunnable = new Runnable() {
            private int lineIndex = 0;
            private int charIndex = 0;

            @Override
            public void run() {
                if (lineIndex < lines.size()) {
                    String currentLine = lines.get(lineIndex);
                    if (charIndex < currentLine.length()) {
                        typedContent += currentLine.charAt(charIndex);
                        charIndex++;
                        updateTerminalDisplay();
                        handler.postDelayed(this, delayBetweenChars);
                    } else {
                        typedContent += "\n";
                        lineIndex++;
                        charIndex = 0;
                        updateTerminalDisplay();
                        handler.postDelayed(this, delayBetweenLines);
                    }
                } else {
                    isTyping = false;
                    btnDiagnostic.setEnabled(true);
                }
            }
        };
        handler.post(typingRunnable);
    }

    private void launchSmartwatchManager() {
        try {
            // First try launching the Pixel Watch Companion app
            Intent intent = getPackageManager().getLaunchIntentForPackage("com.google.android.apps.wear.companion");
            if (intent == null) {
                // Try legacy Wear OS app package
                intent = getPackageManager().getLaunchIntentForPackage("com.google.android.wearable.app");
            }
            if (intent == null) {
                // If not pre-installed/running, try launching explicitly
                intent = new Intent(Intent.ACTION_MAIN);
                intent.addCategory(Intent.CATEGORY_LAUNCHER);
                intent.setComponent(new ComponentName("com.google.android.apps.wear.companion", "com.google.android.apps.wear.companion.main.MainActivity"));
            }
            startActivity(intent);
        } catch (Exception e) {
            // Fallback: Try launching the Google Play Store details page for the companion app
            try {
                Intent playStoreIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.apps.wear.companion"));
                playStoreIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(playStoreIntent);
                Toast.makeText(this, "Pixel Watch app not found. Opening Play Store...", Toast.LENGTH_LONG).show();
            } catch (Exception ex) {
                try {
                    Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.apps.wear.companion"));
                    startActivity(webIntent);
                } catch (Exception e3) {
                    Toast.makeText(this, "Wear companion app not installed. Please configure MU-TH-UR directly on your watch.", Toast.LENGTH_LONG).show();
                }
            }
        }
    }
}
