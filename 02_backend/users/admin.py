from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.utils import timezone
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Display fields in the list view
    list_display = (
        'username', 
        'email', 
        'get_full_name', 
        'get_age', 
        'get_bmi_display',
        'verification_status', 
        'account_status',
        'date_joined_display'
    )
    
    # Add clickable links
    list_display_links = ('username', 'email')
    
    # Filters in the right sidebar
    list_filter = (
        'is_verified',
        'is_active',
        'is_staff',
        'is_superuser',
        'gender',
        'blood_type',
        'date_joined',
    )
    
    # Search fields
    search_fields = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'phone_number'
    )
    
    # Default ordering
    ordering = ('-date_joined',)
    
    # Pagination
    list_per_page = 25
    
    # Date hierarchy for filtering by date
    date_hierarchy = 'date_joined'
    
    # Actions dropdown
    actions = [
        'verify_emails', 
        'unverify_emails', 
        'activate_users', 
        'deactivate_users',
        'send_test_email'
    ]
    
    # Fieldsets for the detail/edit view
    fieldsets = (
        # Basic Information
        ('Login Information', {
            'fields': ('username', 'email', 'password'),
            'classes': ('wide',)
        }),
        
        # Personal Information
        ('Personal Information', {
            'fields': (
                ('first_name', 'last_name'),
                ('phone_number', 'date_of_birth'),
                ('gender', 'blood_type'),
            ),
            'classes': ('wide', 'collapse')
        }),
        
        # Health Information
        ('Health Information', {
            'fields': (
                ('height', 'weight'),
                'get_bmi',
                'get_ideal_weight_range',
            ),
            'classes': ('wide', 'collapse'),
            'description': 'Health metrics and BMI calculations'
        }),
        
        # Email Verification
        ('Email Verification', {
            'fields': (
                'is_verified',
                'email_verified_at',
                'email_verification_token',
                'email_notifications',
            ),
            'classes': ('wide', 'collapse'),
            'description': 'Email verification status and settings'
        }),
        
        # Password Management
        ('Password Management', {
            'fields': (
                'last_password_change',
                'password_reset_token',
                'password_reset_token_created',
            ),
            'classes': ('wide', 'collapse'),
            'description': 'Password reset and security information'
        }),
        
        # Permissions
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
            'classes': ('wide', 'collapse')
        }),
        
        # Important Dates
        ('Important Dates', {
            'fields': (
                'last_login',
                'date_joined',
                'created_at',
                'updated_at',
            ),
            'classes': ('wide', 'collapse')
        }),
    )
    
    # Read-only fields
    readonly_fields = (
        'email_verification_token',
        'password_reset_token',
        'password_reset_token_created',
        'email_verified_at',
        'last_password_change',
        'created_at',
        'updated_at',
        'last_login',
        'date_joined',
        'get_bmi',
        'get_ideal_weight_range',
    )
    
    # Fields for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 
                'email', 
                'password1', 
                'password2',
                'first_name', 
                'last_name',
                'phone_number',
                'date_of_birth',
                'gender',
                'is_verified',
                'is_active',
                'is_staff',
            ),
        }),
    )
    
    # Inline actions for related models (if you have related models)
    # inlines = [UserProfileInline, UserHealthLogInline]
    
    # =========================================================================
    # Custom Display Methods
    # =========================================================================
    
    def get_full_name(self, obj):
        """Display full name with styling"""
        full_name = obj.get_full_name()
        if obj.first_name and obj.last_name:
            return format_html(
                '<strong>{}</strong><br/><small style="color: #666;">{}</small>',
                full_name,
                obj.username
            )
        return format_html('<span style="color: #999;">{}</span>', obj.username)
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'first_name'
    
    def get_age(self, obj):
        """Display age with birthday"""
        age = obj.get_age()
        if age and obj.date_of_birth:
            return format_html(
                '{} (<small>{}</small>)',
                age,
                obj.date_of_birth.strftime('%d/%m/%Y')
            )
        return '-'
    get_age.short_description = 'Age (DOB)'
    
    def get_bmi_display(self, obj):
        """Display BMI with category and color coding"""
        bmi = obj.get_bmi()
        if not bmi:
            return '-'
        
        category = obj.get_bmi_category()
        
        # Color code based on BMI category
        colors = {
            'Underweight': 'orange',
            'Normal weight': 'green',
            'Overweight': 'orange',
            'Obese': 'red'
        }
        color = colors.get(category, 'gray')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} ({})</span>',
            color,
            bmi,
            category
        )
    get_bmi_display.short_description = 'BMI (Category)'
    
    def verification_status(self, obj):
        """Display verification status with icon"""
        if obj.is_verified:
            return format_html(
                '<span style="color: green;">✓ Verified</span><br/><small>{}</small>',
                obj.email_verified_at.strftime('%d/%m/%Y %H:%M') if obj.email_verified_at else ''
            )
        return format_html(
            '<span style="color: orange;">⏳ Pending</span><br/><small>Token: {}...</small>',
            str(obj.email_verification_token)[:8] if obj.email_verification_token else ''
        )
    verification_status.short_description = 'Email Verification'
    
    def account_status(self, obj):
        """Display account status with badge"""
        if not obj.is_active:
            return format_html('<span style="color: red;">● Inactive</span>')
        if obj.is_superuser:
            return format_html('<span style="color: purple;">● Superuser</span>')
        if obj.is_staff:
            return format_html('<span style="color: blue;">● Staff</span>')
        return format_html('<span style="color: green;">● Active</span>')
    account_status.short_description = 'Account Status'
    
    def date_joined_display(self, obj):
        """Display date joined in a friendly format"""
        delta = timezone.now() - obj.date_joined
        days = delta.days
        
        if days == 0:
            return format_html(
                '<span style="color: green;">Today</span><br/><small>{}</small>',
                obj.date_joined.strftime('%H:%M')
            )
        elif days < 7:
            return format_html(
                '<span>{} days ago</span><br/><small>{}</small>',
                days,
                obj.date_joined.strftime('%d/%m')
            )
        else:
            return format_html(
                '<span>{}</span><br/><small>{}</small>',
                obj.date_joined.strftime('%d/%m/%Y'),
                obj.date_joined.strftime('%H:%M')
            )
    date_joined_display.short_description = 'Joined'
    date_joined_display.admin_order_field = 'date_joined'
    
    # =========================================================================
    # Custom Actions
    # =========================================================================
    
    def verify_emails(self, request, queryset):
        """Bulk verify email addresses"""
        updated = 0
        for user in queryset.filter(is_verified=False):
            if user.verify_email():
                updated += 1
        
        self.message_user(
            request, 
            f'Successfully verified {updated} email address(es).'
        )
    verify_emails.short_description = "Verify selected users' emails"
    
    def unverify_emails(self, request, queryset):
        """Bulk unverify email addresses"""
        updated = queryset.update(
            is_verified=False,
            email_verified_at=None
        )
        self.message_user(
            request, 
            f'Successfully unverified {updated} email address(es).'
        )
    unverify_emails.short_description = "Unverify selected users' emails"
    
    def activate_users(self, request, queryset):
        """Bulk activate users"""
        updated = queryset.update(is_active=True)
        self.message_user(
            request, 
            f'Successfully activated {updated} user account(s).'
        )
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        """Bulk deactivate users"""
        # Prevent deactivating yourself
        if request.user in queryset:
            queryset = queryset.exclude(pk=request.user.pk)
            self.message_user(
                request,
                'You cannot deactivate your own account.',
                level='WARNING'
            )
        
        updated = queryset.update(is_active=False)
        self.message_user(
            request, 
            f'Successfully deactivated {updated} user account(s).'
        )
    deactivate_users.short_description = "Deactivate selected users"
    
    def send_test_email(self, request, queryset):
        """Send test email to selected users"""
        from .utils.email_utils import send_verification_email
        
        sent = 0
        for user in queryset:
            try:
                send_verification_email(user, request)
                sent += 1
            except Exception as e:
                self.message_user(
                    request,
                    f'Failed to send email to {user.email}: {str(e)}',
                    level='ERROR'
                )
        
        self.message_user(
            request, 
            f'Successfully sent test emails to {sent} user(s).'
        )
    send_test_email.short_description = "Send test verification email"
    
    # =========================================================================
    # Override Methods
    # =========================================================================
    
    def get_queryset(self, request):
        """Optimize queryset with select_related and prefetch_related"""
        queryset = super().get_queryset(request)
        # Add any related fields you want to prefetch
        # queryset = queryset.select_related('profile').prefetch_related('health_logs')
        return queryset
    
    def save_model(self, request, obj, form, change):
        """Override save to add custom logic"""
        if not change:  # New user
            obj.created_at = timezone.now()
        super().save_model(request, obj, form, change)
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly for non-superusers"""
        readonly_fields = list(self.readonly_fields)
        
        if not request.user.is_superuser:
            # Regular staff can't change these
            readonly_fields.extend(['is_superuser', 'is_staff', 'user_permissions'])
        
        return readonly_fields
    
    def has_delete_permission(self, request, obj=None):
        """Prevent users from deleting themselves"""
        if obj and obj.pk == request.user.pk:
            return False
        return super().has_delete_permission(request, obj)


# Optional: Register related models if you have them
# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ['user', 'get_bmi', 'health_score']
#     search_fields = ['user__username', 'user__email']


# Customize admin site header
admin.site.site_header = 'Diabetes Prediction App Administration'
admin.site.site_title = 'Diabetes App Admin'
admin.site.index_title = 'Dashboard'