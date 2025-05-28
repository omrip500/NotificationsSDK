package com.example.pushnotificationsdk.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.pushnotificationsdk.R;
import com.example.pushnotificationsdk.model.NewsArticle;
import java.util.List;

/**
 * Adapter for displaying news articles in RecyclerView
 */
public class NewsAdapter extends RecyclerView.Adapter<NewsAdapter.NewsViewHolder> {

    private List<NewsArticle> articles;
    private OnArticleClickListener clickListener;

    public interface OnArticleClickListener {
        void onArticleClick(NewsArticle article);
    }

    public NewsAdapter(List<NewsArticle> articles) {
        this.articles = articles;
    }

    public void setOnArticleClickListener(OnArticleClickListener listener) {
        this.clickListener = listener;
    }

    @NonNull
    @Override
    public NewsViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_news_article, parent, false);
        return new NewsViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NewsViewHolder holder, int position) {
        NewsArticle article = articles.get(position);
        holder.bind(article);
    }

    @Override
    public int getItemCount() {
        return articles.size();
    }

    public void updateArticles(List<NewsArticle> newArticles) {
        this.articles = newArticles;
        notifyDataSetChanged();
    }

    class NewsViewHolder extends RecyclerView.ViewHolder {
        private TextView titleText;
        private TextView summaryText;
        private TextView categoryText;
        private TextView timeText;
        private View breakingIndicator;

        public NewsViewHolder(@NonNull View itemView) {
            super(itemView);
            titleText = itemView.findViewById(R.id.text_title);
            summaryText = itemView.findViewById(R.id.text_summary);
            categoryText = itemView.findViewById(R.id.text_category);
            timeText = itemView.findViewById(R.id.text_time);
            breakingIndicator = itemView.findViewById(R.id.breaking_indicator);

            itemView.setOnClickListener(v -> {
                if (clickListener != null && getAdapterPosition() != RecyclerView.NO_POSITION) {
                    clickListener.onArticleClick(articles.get(getAdapterPosition()));
                }
            });
        }

        public void bind(NewsArticle article) {
            titleText.setText(article.getTitle());
            summaryText.setText(article.getSummary());
            categoryText.setText(getCategoryDisplayName(article.getCategory()));
            timeText.setText(article.getPublishTime());
            
            // Show breaking news indicator
            breakingIndicator.setVisibility(article.isBreaking() ? View.VISIBLE : View.GONE);
        }

        private String getCategoryDisplayName(String category) {
            switch (category) {
                case "breaking_news": return "🔴 Breaking";
                case "sports": return "🏈 Sports";
                case "technology": return "💻 Tech";
                case "weather": return "☁️ Weather";
                case "entertainment": return "🎬 Entertainment";
                default: return "📰 News";
            }
        }
    }
}
