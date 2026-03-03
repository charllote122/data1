from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import User
import re

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password is required.',
            'blank': 'Password cannot be empty.'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Please confirm your password.',
            'blank': 'Password confirmation cannot be empty.'
        }
    )
    
    # Phone number validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = serializers.CharField(
        validators=[phone_regex],
        required=False,
        allow_blank=True,
        max_length=15
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'height', 'weight'
        ]
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False, 'allow_null': True},
            'height': {'required': False, 'allow_null': True},
            'weight': {'required': False, 'allow_null': True},
            'email': {'required': True, 'allow_blank': False},
            'username': {'required': True, 'allow_blank': False}
        }

    def validate_username(self, value):
        """Validate username"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        if len(value) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters long.')
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError('Username contains invalid characters.')
        return value

    def validate_email(self, value):
        """Validate email"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_height(self, value):
        """Validate height"""
        if value is not None and (value < 50 or value > 300):
            raise serializers.ValidationError('Height must be between 50cm and 300cm.')
        return value

    def validate_weight(self, value):
        """Validate weight"""
        if value is not None and (value < 20 or value > 500):
            raise serializers.ValidationError('Weight must be between 20kg and 500kg.')
        return value

    def validate_date_of_birth(self, value):
        """Validate date of birth"""
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError('Date of birth cannot be in the future.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password': 'Password fields didn\'t match.'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.is_verified = False
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    username = serializers.CharField(
        required=True,
        error_messages={'required': 'Username is required.'}
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        error_messages={'required': 'Password is required.'}
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to authenticate with username
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            # If not found, try with email
            if not user and '@' in username:
                try:
                    user_obj = User.objects.get(email=username.lower())
                    user = authenticate(
                        request=self.context.get('request'),
                        username=user_obj.username,
                        password=password
                    )
                except User.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )

            if not user.is_verified:
                raise serializers.ValidationError(
                    'Please verify your email before logging in.'
                )

            attrs['user'] = user
            return attrs

        raise serializers.ValidationError(
            'Must include username/email and password.'
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    bmi = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'age', 'height', 'weight',
            'bmi', 'is_verified', 'created_at', 'last_login'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_verified', 'created_at', 'last_login']

    def get_bmi(self, obj):
        return obj.get_bmi()
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_age(self, obj):
        """Calculate age from date of birth"""
        if obj.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - obj.date_of_birth.year - (
                (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
            )
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'height', 'weight'
        ]

    def validate_height(self, value):
        """Validate height"""
        if value is not None and (value < 50 or value > 300):
            raise serializers.ValidationError('Height must be between 50cm and 300cm.')
        return value

    def validate_weight(self, value):
        """Validate weight"""
        if value is not None and (value < 20 or value > 500):
            raise serializers.ValidationError('Weight must be between 20kg and 500kg.')
        return value

    def validate_date_of_birth(self, value):
        """Validate date of birth"""
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError('Date of birth cannot be in the future.')
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.UUIDField(
        required=True,
        error_messages={'required': 'Verification token is required.'}
    )


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField(
        required=True,
        error_messages={'required': 'Email is required.'}
    )


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset"""
    email = serializers.EmailField(
        required=True,
        error_messages={'required': 'Email is required.'}
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset"""
    token = serializers.UUIDField(
        required=True,
        error_messages={'required': 'Reset token is required.'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        error_messages={'required': 'New password is required.'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        error_messages={'required': 'Please confirm your new password.'}
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'new_password': 'Password fields didn\'t match.'
            })
        
        # Additional password strength checks
        password = attrs['new_password']
        if len(password) < 8:
            raise serializers.ValidationError({
                'new_password': 'Password must be at least 8 characters long.'
            })
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one uppercase letter.'
            })
        if not any(char.islower() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one lowercase letter.'
            })
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one digit.'
            })
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password when logged in"""
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        error_messages={'required': 'Current password is required.'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        error_messages={'required': 'New password is required.'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        error_messages={'required': 'Please confirm your new password.'}
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'new_password': 'New passwords didn\'t match.'
            })
        
        # Ensure new password is different from old password
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': 'New password must be different from current password.'
            })
        
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users (admin only)"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 
            'is_verified', 'is_active', 'date_joined', 'last_login'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer (admin only)"""
    full_name = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = '__all__'
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_bmi(self, obj):
        return obj.get_bmi()