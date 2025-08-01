package com.example.pushnotificationsdk;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk_library.R;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationLogAdapter extends RecyclerView.Adapter<NotificationLogAdapter.ViewHolder> {

    private List<NotificationLog> logs;

    public NotificationLogAdapter(List<NotificationLog> logs) {
        this.logs = logs;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_notification_log, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        NotificationLog log = logs.get(position);
        holder.titleText.setText(log.getTitle());
        holder.bodyText.setText(log.getBody());
        holder.sentAtText.setText("Sent at: " + log.getSentAt());

        holder.deleteButton.setOnClickListener(v -> {
            String logId = log.getId(); // Ensure NotificationLog includes the _id field
            Log.d("Adapter", "Delete request sent for ID: " + logId);
            PushApiService service = ApiClient.getService();
            service.deleteNotification(logId).enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        int pos = holder.getAdapterPosition();
                        logs.remove(pos);
                        notifyItemRemoved(pos);
                        notifyItemRangeChanged(pos, logs.size());
                        Log.d("Adapter", "Notification deleted successfully");
                    } else {
                        Log.e("Adapter", "Delete failed: " + response.code());
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    Log.e("Adapter", "Delete request failed", t);
                }
            });
        });
    }

    @Override
    public int getItemCount() {
        return logs.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        public TextView titleText;
        public TextView bodyText;
        public TextView sentAtText;
        public ImageButton deleteButton;

        public ViewHolder(View view) {
            super(view);
            titleText = view.findViewById(R.id.text_title);
            bodyText = view.findViewById(R.id.text_body);
            sentAtText = view.findViewById(R.id.text_sent_at);
            deleteButton = view.findViewById(R.id.button_delete);
        }
    }
}
