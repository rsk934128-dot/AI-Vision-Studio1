package com.aivideostudio.app;

import android.content.Intent;
import android.os.Build;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ForegroundAudioService")
public class ForegroundAudioPlugin extends Plugin {

    @PluginMethod
    public void startForegroundService(PluginCall call) {
        String title = call.getString("title", "AI Video Studio • Audio Playing");
        String body = call.getString("body", "Background audio stream active");

        try {
            Intent intent = new Intent(getContext(), ForegroundAudioService.class);
            intent.setAction(ForegroundAudioService.ACTION_START);
            intent.putExtra(ForegroundAudioService.EXTRA_TITLE, title);
            intent.putExtra(ForegroundAudioService.EXTRA_BODY, body);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(getContext(), intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Foreground audio service started");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start foreground service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopForegroundService(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), ForegroundAudioService.class);
            intent.setAction(ForegroundAudioService.ACTION_STOP);
            getContext().startService(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Foreground audio service stopped");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop foreground service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void updateNotification(PluginCall call) {
        String title = call.getString("title", "AI Video Studio • Audio Playing");
        String body = call.getString("body", "Background audio stream active");

        try {
            Intent intent = new Intent(getContext(), ForegroundAudioService.class);
            intent.setAction(ForegroundAudioService.ACTION_START);
            intent.putExtra(ForegroundAudioService.EXTRA_TITLE, title);
            intent.putExtra(ForegroundAudioService.EXTRA_BODY, body);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(getContext(), intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update notification: " + e.getMessage(), e);
        }
    }
}
