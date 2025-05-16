package com.example.pushnotificationsdk;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk_library.R;

import java.util.List;

public class NotificationLogAdapter extends RecyclerView.Adapter<NotificationLogAdapter.ViewHolder> {

    private List<com.example.pushnotificationssdk.NotificationLog> logs;

    public NotificationLogAdapter(List<com.example.pushnotificationssdk.NotificationLog> logs) {
        this.logs = logs;
    }

    @Override
    public NotificationLogAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_notification_log, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(NotificationLogAdapter.ViewHolder holder, int position) {
        com.example.pushnotificationssdk.NotificationLog log = logs.get(position);
        holder.titleText.setText(log.getTitle());
        holder.bodyText.setText(log.getBody());
        holder.sentAtText.setText("Sent at: " + log.getSentAt());
    }

    @Override
    public int getItemCount() {
        return logs.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        public TextView titleText;
        public TextView bodyText;
        public TextView sentAtText;

        public ViewHolder(View view) {
            super(view);
            titleText = view.findViewById(com.example.pushnotificationsdk_library.R.id.text_title);
            bodyText = view.findViewById(R.id.text_body);
            sentAtText = view.findViewById(R.id.text_sent_at);
        }
    }
}
