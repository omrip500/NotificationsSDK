package com.example.pushnotificationsdk;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk.adapter.NewsAdapter;
import com.example.pushnotificationsdk.data.NewsDataProvider;
import com.example.pushnotificationsdk.model.NewsArticle;


import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private PushNotificationManager notificationManager;
    private RecyclerView newsRecyclerView;
    private NewsAdapter newsAdapter;
    private List<NewsArticle> newsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Setup toolbar
        setupToolbar();

        initializeSDK();

        setupNewsRecyclerView();
    }

    private void initializeSDK() {
        String appId = "684b0552a1b58761558f1068";
        notificationManager = PushNotificationManager.initialize(this, appId);

        notificationManager.loadInterestsFromServer(new PushNotificationManager.InterestsLoadCallback() {
            @Override
            public void onInterestsLoaded(List<String> interests) {
                Log.d("MainActivity", "✅ Interests loaded from server: " + interests);
            }

            @Override
            public void onInterestsLoadFailed(String error) {
                Log.w("MainActivity", "⚠️ Failed to load interests from server: " + error);
                Log.d("MainActivity", "🔄 Using default configuration...");
            }
        });


        UserInfo currentUser = new UserInfo(
                "user_omri",
                "male",
                24,
                new ArrayList<>(),
                32.0853,
                34.7818
        );

        notificationManager.setCurrentUser(currentUser);

    }



    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Forward permission results to the SDK
        if (notificationManager != null) {
            notificationManager.onNotificationPermissionResult(requestCode, permissions, grantResults);
        }
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("News Demo App");
        }
    }

    private void setupNewsRecyclerView() {
        newsRecyclerView = findViewById(R.id.news_recycler_view);
        newsRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Load sample news data
        newsList = NewsDataProvider.getSampleNews();
        newsAdapter = new NewsAdapter(newsList);

        // Set click listener for news articles
        newsAdapter.setOnArticleClickListener(article -> {
            Intent intent = new Intent(MainActivity.this, NewsDetailActivity.class);
            intent.putExtra("article_id", article.getId());
            intent.putExtra("article_title", article.getTitle());
            intent.putExtra("article_summary", article.getSummary());
            intent.putExtra("article_category", article.getCategory());
            intent.putExtra("article_time", article.getPublishTime());
            intent.putExtra("article_breaking", article.isBreaking());
            startActivity(intent);
        });

        newsRecyclerView.setAdapter(newsAdapter);

        Log.d("MainActivity", "✅ News RecyclerView setup complete with " + newsList.size() + " articles");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_settings) {
            Intent intent = new Intent(this, AppSettingsActivity.class);
            startActivity(intent);
            return true;
        } else if (id == R.id.action_enable_notifications) {
            Log.d("MainActivity", "🔔 Opening Notification Setup Screen");
            notificationManager.launchNotificationSetupScreen(this);
            return true;
        } else if (id == R.id.action_notification_history) {
            Log.d("MainActivity", "📋 Opening Notification History Screen");
            notificationManager.launchNotificationHistoryScreen(this);
            return true;
        } else if (id == R.id.action_filter_all) {
            showAllNews();
            return true;
        } else if (id == R.id.action_filter_breaking) {
            filterNewsByCategory("breaking_news");
            return true;
        } else if (id == R.id.action_filter_sports) {
            filterNewsByCategory("sports");
            return true;
        } else if (id == R.id.action_filter_technology) {
            filterNewsByCategory("technology");
            return true;
        } else if (id == R.id.action_filter_weather) {
            filterNewsByCategory("weather");
            return true;
        } else if (id == R.id.action_filter_entertainment) {
            filterNewsByCategory("entertainment");
            return true;
        } else if (id == R.id.action_refresh) {
            refreshNews();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void filterNewsByCategory(String category) {
        List<NewsArticle> filteredNews;
        String categoryName;

        if (category.equals("breaking_news")) {
            filteredNews = NewsDataProvider.getBreakingNews();
            categoryName = "Breaking News";
        } else {
            filteredNews = NewsDataProvider.getNewsByCategory(category);
            categoryName = getCategoryDisplayName(category);
        }

        newsAdapter.updateArticles(filteredNews);
        Toast.makeText(this, "Showing " + filteredNews.size() + " " + categoryName + " articles", Toast.LENGTH_SHORT).show();
    }

    private void showAllNews() {
        newsAdapter.updateArticles(newsList);
        Toast.makeText(this, "Showing all " + newsList.size() + " articles", Toast.LENGTH_SHORT).show();
    }

    private void refreshNews() {
        // Simulate refresh by reloading data
        newsList = NewsDataProvider.getSampleNews();
        newsAdapter.updateArticles(newsList);
        Toast.makeText(this, "News refreshed", Toast.LENGTH_SHORT).show();
    }

    private String getCategoryDisplayName(String category) {
        switch (category) {
            case "breaking_news": return "Breaking News";
            case "sports": return "Sports";
            case "technology": return "Technology";
            case "weather": return "Weather";
            case "entertainment": return "Entertainment";
            default: return "News";
        }
    }
}
