package com.example.pushnotificationsdk;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

/**
 * Activity to display detailed view of a news article
 */
public class NewsDetailActivity extends AppCompatActivity {

    private TextView titleText;
    private TextView categoryText;
    private TextView timeText;
    private TextView summaryText;
    private TextView fullContentText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_news_detail);

        setupToolbar();
        initializeViews();
        loadArticleData();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Article Details");
        }
    }

    private void initializeViews() {
        titleText = findViewById(R.id.text_title);
        categoryText = findViewById(R.id.text_category);
        timeText = findViewById(R.id.text_time);
        summaryText = findViewById(R.id.text_summary);
        fullContentText = findViewById(R.id.text_full_content);
    }

    private void loadArticleData() {
        Intent intent = getIntent();
        
        String title = intent.getStringExtra("article_title");
        String summary = intent.getStringExtra("article_summary");
        String category = intent.getStringExtra("article_category");
        String time = intent.getStringExtra("article_time");
        boolean isBreaking = intent.getBooleanExtra("article_breaking", false);

        if (title != null) {
            titleText.setText(title);
            summaryText.setText(summary);
            categoryText.setText(getCategoryDisplayName(category));
            timeText.setText(time);
            
            // Generate full content (this would normally come from a server)
            String fullContent = generateFullContent(title, summary);
            fullContentText.setText(fullContent);
            
            // Update toolbar title for breaking news
            if (isBreaking && getSupportActionBar() != null) {
                getSupportActionBar().setTitle("🔴 Breaking News");
            }
        } else {
            Toast.makeText(this, "Error loading article", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    private String getCategoryDisplayName(String category) {
        switch (category) {
            case "breaking_news": return "🔴 Breaking News";
            case "sports": return "🏈 Sports";
            case "technology": return "💻 Technology";
            case "weather": return "☁️ Weather";
            case "entertainment": return "🎬 Entertainment";
            default: return "📰 News";
        }
    }

    private String generateFullContent(String title, String summary) {
        // This is a demo - in a real app, this would come from your backend
        StringBuilder content = new StringBuilder();
        content.append(summary).append("\n\n");
        
        content.append("This is a detailed news article about the topic mentioned in the title. ");
        content.append("In a real application, this content would be fetched from your news API or database.\n\n");
        
        content.append("Key Points:\n");
        content.append("• This is a demonstration of the Push Notifications SDK\n");
        content.append("• The SDK allows you to send targeted notifications to users\n");
        content.append("• Users can customize their notification preferences\n");
        content.append("• The SDK supports different categories of notifications\n\n");
        
        content.append("The Push Notifications SDK provides a complete solution for managing user notifications ");
        content.append("in your mobile application. It includes user registration, preference management, ");
        content.append("and notification history tracking.\n\n");
        
        content.append("For more information about implementing the SDK in your application, ");
        content.append("please refer to the developer documentation included with this demo.");
        
        return content.toString();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
