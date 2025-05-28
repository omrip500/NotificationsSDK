package com.example.pushnotificationsdk.model;

/**
 * Model class for news articles
 */
public class NewsArticle {
    private String id;
    private String title;
    private String summary;
    private String category;
    private String imageUrl;
    private String publishTime;
    private boolean isBreaking;

    public NewsArticle(String id, String title, String summary, String category, 
                      String imageUrl, String publishTime, boolean isBreaking) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.category = category;
        this.imageUrl = imageUrl;
        this.publishTime = publishTime;
        this.isBreaking = isBreaking;
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getSummary() { return summary; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public String getPublishTime() { return publishTime; }
    public boolean isBreaking() { return isBreaking; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setCategory(String category) { this.category = category; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    public void setBreaking(boolean breaking) { isBreaking = breaking; }
}
