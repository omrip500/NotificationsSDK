package com.example.pushnotificationsdk.data;

import com.example.pushnotificationsdk.model.NewsArticle;
import java.util.ArrayList;
import java.util.List;

/**
 * Provides sample news data for the demo app
 */
public class NewsDataProvider {

    public static List<NewsArticle> getSampleNews() {
        List<NewsArticle> articles = new ArrayList<>();

        // Breaking News
        articles.add(new NewsArticle(
                "1",
                "Major Tech Conference Announced",
                "The biggest technology conference of the year will be held next month with major announcements expected.",
                "breaking_news",
                "",
                "2 hours ago",
                true
        ));

        // Sports
        articles.add(new NewsArticle(
                "2",
                "Championship Finals This Weekend",
                "Two top teams will face off in what promises to be an exciting championship match.",
                "sports",
                "",
                "4 hours ago",
                false
        ));

        articles.add(new NewsArticle(
                "3",
                "Record-Breaking Performance",
                "Athlete sets new world record in swimming competition, breaking a 10-year-old record.",
                "sports",
                "",
                "6 hours ago",
                false
        ));

        // Technology
        articles.add(new NewsArticle(
                "4",
                "New AI Breakthrough Announced",
                "Researchers develop new artificial intelligence system that can understand human emotions.",
                "technology",
                "",
                "8 hours ago",
                false
        ));

        articles.add(new NewsArticle(
                "5",
                "Smartphone Innovation",
                "Latest smartphone features revolutionary camera technology and extended battery life.",
                "technology",
                "",
                "12 hours ago",
                false
        ));

        // Weather
        articles.add(new NewsArticle(
                "6",
                "Sunny Weather Expected",
                "Clear skies and warm temperatures forecasted for the weekend with light winds.",
                "weather",
                "",
                "1 day ago",
                false
        ));

        // Entertainment
        articles.add(new NewsArticle(
                "7",
                "New Movie Breaks Box Office Records",
                "Latest blockbuster film earns highest opening weekend revenue in cinema history.",
                "entertainment",
                "",
                "1 day ago",
                false
        ));

        articles.add(new NewsArticle(
                "8",
                "Celebrity Announces New Project",
                "Popular actor reveals upcoming collaboration with renowned director for next year's film.",
                "entertainment",
                "",
                "2 days ago",
                false
        ));

        return articles;
    }

    public static List<NewsArticle> getNewsByCategory(String category) {
        List<NewsArticle> allNews = getSampleNews();
        List<NewsArticle> filteredNews = new ArrayList<>();

        for (NewsArticle article : allNews) {
            if (article.getCategory().equals(category)) {
                filteredNews.add(article);
            }
        }

        return filteredNews;
    }

    public static List<NewsArticle> getBreakingNews() {
        List<NewsArticle> allNews = getSampleNews();
        List<NewsArticle> breakingNews = new ArrayList<>();

        for (NewsArticle article : allNews) {
            if (article.isBreaking()) {
                breakingNews.add(article);
            }
        }

        return breakingNews;
    }
}
