package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.InterestOption;
import com.example.pushnotificationsdk.UserInfo;
import com.example.pushnotificationsdk.adapter.NewsAdapter;
import com.example.pushnotificationsdk.data.NewsDataProvider;
import com.example.pushnotificationsdk.model.NewsArticle;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private PushNotificationManager notificationManager;
    private RecyclerView newsRecyclerView;
    private NewsAdapter newsAdapter;
    private List<NewsArticle> currentNews;
    private String currentCategory = "all";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Setup toolbar
        setupToolbar();

        // ✨ Initialize and Configure the SDK ✨
        initializeSDK();

        // Setup news UI
        setupNewsUI();

        // Load initial news
        loadNews("all");
    }

    private void initializeSDK() {
        // ✨ Initialize SDK with your App ID ✨
        String appId = "6825f0b2f5d70b84cf230fbf"; // Your app ID from the dashboard
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure SDK with notification types and settings
        configureSDK();

        // Set current user (this simulates a logged-in user in your app)
        setCurrentUser();

        // Start Firebase Messaging
        notificationManager.start();

        Log.d("MainActivity", "✅ SDK fully initialized and configured");
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("📰 NewsHub");
        }
    }

    private void setupNewsUI() {
        newsRecyclerView = findViewById(R.id.news_recycler_view);
        newsRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        currentNews = new ArrayList<>();
        newsAdapter = new NewsAdapter(currentNews);
        newsAdapter.setOnArticleClickListener(article -> {
            Toast.makeText(this, "Reading: " + article.getTitle(), Toast.LENGTH_SHORT).show();
        });

        newsRecyclerView.setAdapter(newsAdapter);
    }

    private void loadNews(String category) {
        currentCategory = category;

        if (category.equals("all")) {
            currentNews = NewsDataProvider.getSampleNews();
        } else if (category.equals("breaking")) {
            currentNews = NewsDataProvider.getBreakingNews();
        } else {
            currentNews = NewsDataProvider.getNewsByCategory(category);
        }

        newsAdapter.updateArticles(currentNews);

        // Update toolbar title
        if (getSupportActionBar() != null) {
            String title = "📰 NewsHub";
            if (!category.equals("all")) {
                title += " - " + getCategoryDisplayName(category);
            }
            getSupportActionBar().setTitle(title);
        }
    }

    private String getCategoryDisplayName(String category) {
        switch (category) {
            case "breaking": return "🔴 Breaking";
            case "breaking_news": return "🔴 Breaking";
            case "sports": return "🏈 Sports";
            case "technology": return "💻 Technology";
            case "weather": return "☁️ Weather";
            case "entertainment": return "🎬 Entertainment";
            default: return "📰 All News";
        }
    }

    private void configureSDK() {
        // Configure SDK with custom notification types and settings
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("breaking_news", "Breaking News", "Important breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports scores and game updates"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts and daily forecasts"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news and product launches"))
                .addInterest(new InterestOption("entertainment", "Entertainment", "Movies, TV shows and celebrity news"))
                .showLocationBasedNotifications(true)
                .build();

        notificationManager.configure(config);
        Log.d("MainActivity", "✅ SDK configured with notification types");
    }

    private void setCurrentUser() {
        // This simulates setting the current logged-in user
        // In a real app, this would come from your user management system
        List<String> emptyInterests = new ArrayList<>(); // Interests will be selected in setup screen
        UserInfo currentUser = new UserInfo(
                "omripeer",           // User ID from your app
                "male",               // Gender from user profile
                24,                   // Age from user profile
                emptyInterests,       // Empty - will be filled in setup screen
                32.0853,              // User's latitude (Tel Aviv)
                34.7818               // User's longitude (Tel Aviv)
        );

        notificationManager.setCurrentUser(currentUser);
        Log.d("MainActivity", "✅ Current user set: " + currentUser.getUserId());
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_all_news) {
            loadNews("all");
            return true;
        } else if (id == R.id.action_breaking) {
            loadNews("breaking");
            return true;
        } else if (id == R.id.action_sports) {
            loadNews("sports");
            return true;
        } else if (id == R.id.action_technology) {
            loadNews("technology");
            return true;
        } else if (id == R.id.action_weather) {
            loadNews("weather");
            return true;
        } else if (id == R.id.action_entertainment) {
            loadNews("entertainment");
            return true;
        } else if (id == R.id.action_notifications) {
            notificationManager.launchNotificationSetupScreen(this);
            return true;
        } else if (id == R.id.action_history) {
            notificationManager.launchNotificationHistoryScreen(this);
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
