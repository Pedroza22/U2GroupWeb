from django.contrib import admin
from .models import Project, ProjectImage, Blog, BlogImage, BlogLikeFavorite, ProjectLikeFavorite, MarketplaceProduct, SiteConfig

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 1

class ProjectAdmin(admin.ModelAdmin):
    inlines = [ProjectImageInline]
    list_display = ("title", "category", "year", "featured", "status")
    search_fields = ("title", "category", "year")
    list_filter = ("category", "featured", "year", "status")
    readonly_fields = ("created_at", "updated_at")

class BlogAdmin(admin.ModelAdmin):
    inlines = [BlogImageInline]
    list_display = ("title", "author", "date", "category", "featured")
    search_fields = ("title", "author", "category")
    list_filter = ("category", "featured", "date")

admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectImage)
admin.site.register(Blog, BlogAdmin)
admin.site.register(BlogImage)
admin.site.register(BlogLikeFavorite)
admin.site.register(ProjectLikeFavorite)
admin.site.register(MarketplaceProduct)
admin.site.register(SiteConfig) 