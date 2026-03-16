// src/pages/health-coach/DietPlanner.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartIcon,
    FireIcon,
    ClockIcon,
    ShoppingBagIcon,
    SparklesIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    SunIcon,
    MoonIcon,
    BeakerIcon,
    ScaleIcon,
    BoltIcon,
    DocumentTextIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DietPlanner = () => {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [loading, setLoading] = useState(false);
    const [mealPlan, setMealPlan] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [preferences, setPreferences] = useState({
        diet_type: 'mediterranean',
        allergies: [],
        restrictions: [],
        meals_per_day: 3,
        calorie_target: 2000,
        carb_target: 'moderate',
        protein_target: 'moderate',
    });

    // ============================================
    // COMPLETE DIET TYPES DATABASE
    // ============================================
    const dietTypes = [
        {
            id: 'diabetes-friendly',
            name: 'Diabetes-Friendly',
            icon: HeartIcon,
            color: 'primary',
            description: 'Low glycemic, balanced meals for blood sugar control',
            benefits: [
                'Stabilizes blood glucose levels',
                'High in fiber for slow digestion',
                'Controlled carbohydrate portions',
                'Rich in non-starchy vegetables'
            ],
            best_for: 'Type 1 and Type 2 diabetes, prediabetes',
            glycemic_index: 'Low',
            examples: ['Leafy greens', 'Lean proteins', 'Whole grains', 'Berries']
        },
        {
            id: 'mediterranean',
            name: 'Mediterranean',
            icon: HeartIcon,
            color: 'green',
            description: 'Heart-healthy with healthy fats, fish, and olive oil',
            benefits: [
                'Rich in omega-3 fatty acids',
                'Anti-inflammatory properties',
                'Supports heart health',
                'High in antioxidants'
            ],
            best_for: 'Heart disease, diabetes, longevity',
            glycemic_index: 'Low to Medium',
            examples: ['Olive oil', 'Fish', 'Nuts', 'Tomatoes', 'Whole grains']
        },
        {
            id: 'low-carb',
            name: 'Low Carb',
            icon: FireIcon,
            color: 'orange',
            description: 'Reduce carbohydrates for better glucose management',
            benefits: [
                'Rapid blood sugar improvement',
                'Reduced insulin requirements',
                'Weight loss acceleration',
                'Decreased appetite'
            ],
            best_for: 'Type 2 diabetes, insulin resistance, obesity',
            glycemic_index: 'Very Low',
            examples: ['Meat', 'Fish', 'Eggs', 'Vegetables', 'Healthy fats']
        },
        {
            id: 'dash',
            name: 'DASH Diet',
            icon: ScaleIcon,
            color: 'blue',
            description: 'Dietary Approaches to Stop Hypertension',
            benefits: [
                'Lowers blood pressure',
                'Reduces cholesterol',
                'Heart-healthy approach',
                'Sodium controlled'
            ],
            best_for: 'Hypertension, heart disease, diabetes with high BP',
            glycemic_index: 'Low to Medium',
            examples: ['Fruits', 'Vegetables', 'Whole grains', 'Lean protein']
        },
        {
            id: 'vegetarian',
            name: 'Vegetarian',
            icon: HeartIcon,
            color: 'emerald',
            description: 'Plant-based meals, no meat',
            benefits: [
                'High fiber content',
                'Low in saturated fat',
                'Rich in antioxidants',
                'Environmentally friendly'
            ],
            best_for: 'Ethical vegetarians, weight management',
            glycemic_index: 'Variable',
            examples: ['Legumes', 'Tofu', 'Vegetables', 'Dairy', 'Eggs']
        },
        {
            id: 'vegan',
            name: 'Vegan',
            icon: HeartIcon,
            color: 'teal',
            description: '100% plant-based, no animal products',
            benefits: [
                'No cholesterol',
                'High in fiber',
                'Low environmental impact',
                'Rich in phytochemicals'
            ],
            best_for: 'Ethical vegans, environmental consciousness',
            glycemic_index: 'Low to Medium',
            examples: ['Fruits', 'Vegetables', 'Legumes', 'Nuts', 'Seeds']
        },
        {
            id: 'keto',
            name: 'Keto',
            icon: BoltIcon,
            color: 'amber',
            description: 'High fat, very low carb for ketosis',
            benefits: [
                'Rapid weight loss',
                'Mental clarity',
                'Reduced appetite',
                'Stable energy'
            ],
            best_for: 'Epilepsy, obesity, type 2 diabetes',
            glycemic_index: 'Very Low',
            examples: ['Meat', 'Fatty fish', 'Eggs', 'Butter', 'Oils']
        },
        {
            id: 'paleo',
            name: 'Paleo',
            icon: FireIcon,
            color: 'orange',
            description: 'Whole foods, no processed items',
            benefits: [
                'Natural, unprocessed foods',
                'High protein intake',
                'No added sugars',
                'Eliminates grains and dairy'
            ],
            best_for: 'Autoimmune conditions, digestive issues',
            glycemic_index: 'Low',
            examples: ['Lean meats', 'Fish', 'Fruits', 'Vegetables', 'Nuts']
        },
        {
            id: 'gluten-free',
            name: 'Gluten-Free',
            icon: HeartIcon,
            color: 'purple',
            description: 'No wheat, barley, or rye',
            benefits: [
                'Essential for celiac disease',
                'Reduces digestive inflammation',
                'Improves energy',
                'Better nutrient absorption'
            ],
            best_for: 'Celiac disease, gluten sensitivity',
            glycemic_index: 'Variable',
            examples: ['Rice', 'Quinoa', 'Corn', 'Potatoes', 'Gluten-free oats']
        },
        {
            id: 'low-sodium',
            name: 'Low Sodium',
            icon: ScaleIcon,
            color: 'blue',
            description: 'Reduced salt for blood pressure',
            benefits: [
                'Lowers blood pressure',
                'Reduces fluid retention',
                'Kidney protection',
                'Heart health'
            ],
            best_for: 'Hypertension, kidney disease, heart failure',
            glycemic_index: 'Variable',
            examples: ['Fresh foods', 'Herbs for seasoning', 'No-salt products']
        },
        {
            id: 'renal',
            name: 'Renal-Friendly',
            icon: HeartIcon,
            color: 'red',
            description: 'Kidney-friendly, low phosphorus and potassium',
            benefits: [
                'Protects kidney function',
                'Balances electrolytes',
                'Controlled protein intake',
                'Manages fluid balance'
            ],
            best_for: 'Chronic kidney disease, dialysis patients',
            glycemic_index: 'Variable',
            examples: ['Apples', 'Cabbage', 'Garlic', 'Bell peppers']
        },
        {
            id: 'pescatarian',
            name: 'Pescatarian',
            icon: HeartIcon,
            color: 'cyan',
            description: 'Vegetarian plus fish and seafood',
            benefits: [
                'Rich in omega-3 fatty acids',
                'Lean protein sources',
                'Heart-healthy approach',
                'Sustainable protein'
            ],
            best_for: 'Heart health, diabetes management',
            glycemic_index: 'Low to Medium',
            examples: ['Salmon', 'Tuna', 'Shrimp', 'Vegetables', 'Legumes']
        },
        {
            id: 'flexitarian',
            name: 'Flexitarian',
            icon: HeartIcon,
            color: 'lime',
            description: 'Mostly vegetarian with occasional meat',
            benefits: [
                'Flexible approach',
                'Sustainable long-term',
                'Balanced nutrition',
                'Easy to follow'
            ],
            best_for: 'Transitioning to vegetarian, flexibility seekers',
            glycemic_index: 'Variable',
            examples: ['Mostly plants', 'Occasional meat', 'Eggs', 'Dairy']
        },
        {
            id: 'whole30',
            name: 'Whole30',
            icon: FireIcon,
            color: 'orange',
            description: '30-day elimination diet',
            benefits: [
                'Resets metabolism',
                'Identifies food sensitivities',
                'Breaks unhealthy habits',
                'Reduces inflammation'
            ],
            best_for: 'Identifying food triggers, resetting eating habits',
            glycemic_index: 'Low',
            examples: ['Meat', 'Seafood', 'Eggs', 'Vegetables', 'Fruits']
        },
        {
            id: 'low-fat',
            name: 'Low Fat',
            icon: HeartIcon,
            color: 'green',
            description: 'Reduced fat for weight management',
            benefits: [
                'Lower calorie intake',
                'Heart-healthy approach',
                'Weight loss support',
                'Reduced cholesterol'
            ],
            best_for: 'Gallbladder issues, weight management',
            glycemic_index: 'Medium to High',
            examples: ['Lean proteins', 'Fruits', 'Vegetables', 'Whole grains']
        },
        {
            id: 'high-protein',
            name: 'High Protein',
            icon: BoltIcon,
            color: 'red',
            description: 'Increased protein for muscle and satiety',
            benefits: [
                'Muscle building and preservation',
                'Increased satiety',
                'Higher metabolism',
                'Blood sugar stability'
            ],
            best_for: 'Athletes, muscle gain, diabetes management',
            glycemic_index: 'Low',
            examples: ['Chicken', 'Fish', 'Eggs', 'Greek yogurt', 'Legumes']
        },
        {
            id: 'low-fodmap',
            name: 'Low FODMAP',
            icon: HeartIcon,
            color: 'purple',
            description: 'For IBS and digestive issues',
            benefits: [
                'Reduces bloating and gas',
                'Manages IBS symptoms',
                'Improves digestive comfort',
                'Identifies trigger foods'
            ],
            best_for: 'IBS, SIBO, digestive sensitivity',
            glycemic_index: 'Variable',
            examples: ['Rice', 'Potatoes', 'Carrots', 'Eggplant', 'Spinach']
        },
        {
            id: 'anti-inflammatory',
            name: 'Anti-Inflammatory',
            icon: HeartIcon,
            color: 'blue',
            description: 'Foods that reduce inflammation',
            benefits: [
                'Reduces chronic inflammation',
                'Joint pain relief',
                'Immune system support',
                'Disease prevention'
            ],
            best_for: 'Arthritis, autoimmune conditions, chronic inflammation',
            glycemic_index: 'Low',
            examples: ['Turmeric', 'Ginger', 'Berries', 'Fatty fish', 'Leafy greens']
        }
    ];

    // ============================================
    // CARBOHYDRATE TARGET OPTIONS
    // ============================================
    const carbTargets = [
        { id: 'low', name: 'Low (20-50g/day)', description: 'For strict blood sugar control', carbs: '20-50g' },
        { id: 'moderate', name: 'Moderate (50-100g/day)', description: 'Balanced approach', carbs: '50-100g' },
        { id: 'liberal', name: 'Liberal (100-150g/day)', description: 'For active individuals', carbs: '100-150g' },
        { id: 'keto', name: 'Keto (<20g/day)', description: 'For ketogenic diet', carbs: '<20g' },
    ];

    // ============================================
    // COMMON ALLERGENS
    // ============================================
    const commonAllergies = [
        'dairy', 'eggs', 'gluten', 'peanuts', 'tree nuts',
        'soy', 'fish', 'shellfish', 'sesame', 'corn', 'wheat'
    ];

    // ============================================
    // GENERATE MEAL PLAN FUNCTION
    // ============================================
    const generateMealPlan = () => {
        setLoading(true);

        // Find the selected diet type details
        const selectedDiet = dietTypes.find(d => d.id === preferences.diet_type);

        // Simulate API call (replace with actual AI service)
        setTimeout(() => {
            // Create meal plan based on preferences
            const newMealPlan = {
                diet_type: selectedDiet?.name || 'Mediterranean',
                diet_description: selectedDiet?.description || '',
                meals_per_day: preferences.meals_per_day,
                calorie_target: preferences.calorie_target,
                carb_target: carbTargets.find(c => c.id === preferences.carb_target)?.name || 'Moderate',

                // Sample meals (would come from AI)
                meals: {
                    breakfast: [
                        {
                            name: preferences.diet_type === 'keto' ? 'Keto Scrambled Eggs' :
                                preferences.diet_type === 'vegetarian' ? 'Greek Yogurt Bowl' :
                                    'Mediterranean Breakfast Bowl',
                            description: getMealDescription('breakfast', preferences.diet_type),
                            calories: 320,
                            protein: 22,
                            carbs: preferences.carb_target === 'low' ? 8 : 28,
                            fat: 14,
                            ingredients: getIngredients('breakfast', preferences),
                            prep_time: 10,
                            glycemic_index: 'low',
                            image: '🍳',
                            tips: getMealTips('breakfast', preferences.diet_type)
                        }
                    ],
                    lunch: [
                        {
                            name: preferences.diet_type === 'keto' ? 'Keto Chicken Salad' :
                                preferences.diet_type === 'vegetarian' ? 'Quinoa Buddha Bowl' :
                                    'Grilled Salmon Salad',
                            description: getMealDescription('lunch', preferences.diet_type),
                            calories: 450,
                            protein: 35,
                            carbs: preferences.carb_target === 'low' ? 12 : 35,
                            fat: 18,
                            ingredients: getIngredients('lunch', preferences),
                            prep_time: 15,
                            glycemic_index: 'low',
                            image: '🥗',
                            tips: getMealTips('lunch', preferences.diet_type)
                        }
                    ],
                    dinner: [
                        {
                            name: preferences.diet_type === 'keto' ? 'Keto Salmon' :
                                preferences.diet_type === 'vegetarian' ? 'Vegetable Stir-Fry' :
                                    'Baked Cod with Vegetables',
                            description: getMealDescription('dinner', preferences.diet_type),
                            calories: 420,
                            protein: 38,
                            carbs: preferences.carb_target === 'low' ? 10 : 30,
                            fat: 16,
                            ingredients: getIngredients('dinner', preferences),
                            prep_time: 25,
                            glycemic_index: 'very low',
                            image: '🐟',
                            tips: getMealTips('dinner', preferences.diet_type)
                        }
                    ],
                    snacks: [
                        {
                            name: 'Healthy Snack Options',
                            description: 'Quick and nutritious snacks',
                            calories: 150,
                            protein: 8,
                            carbs: 15,
                            fat: 7,
                            ingredients: ['Apple', 'Almonds', 'Greek yogurt', 'Vegetable sticks'],
                            prep_time: 2,
                            glycemic_index: 'low',
                            image: '🍎',
                            tips: 'Prep snacks ahead for busy days'
                        }
                    ]
                },

                // Generate shopping list based on allergies
                shopping_list: generateShoppingList(preferences),

                // Generate personalized tips
                tips: generateTips(preferences, selectedDiet),

                // Blood sugar management guide
                glycemic_guide: {
                    low: ['Non-starchy vegetables', 'Legumes', 'Nuts', 'Seeds', 'Berries'],
                    medium: ['Whole grains', 'Brown rice', 'Sweet potatoes', 'Corn'],
                    high: ['White bread', 'White rice', 'Potatoes', 'Sugary drinks']
                }
            };

            setMealPlan(newMealPlan);
            setLoading(false);
            toast.success(`🎉 Your ${selectedDiet?.name} meal plan is ready!`);
        }, 2000);
    };

    // ============================================
    // HELPER FUNCTIONS FOR MEAL GENERATION
    // ============================================

    const getMealDescription = (meal, dietType) => {
        const descriptions = {
            breakfast: {
                mediterranean: 'Start your day with protein-rich Greek yogurt and antioxidant berries',
                'low-carb': 'High-protein eggs with healthy fats to keep you full',
                vegetarian: 'Plant-based protein bowl with fresh fruits and nuts',
                keto: 'High-fat, low-carb eggs with avocado for sustained energy',
                default: 'Nutritious breakfast to start your day right'
            },
            lunch: {
                mediterranean: 'Fresh salmon with quinoa and olive oil dressing',
                'low-carb': 'Grilled chicken over crisp greens with avocado',
                vegetarian: 'Protein-packed quinoa bowl with roasted vegetables',
                keto: 'High-fat chicken salad with olive oil and avocado',
                default: 'Balanced lunch with lean protein and vegetables'
            },
            dinner: {
                mediterranean: 'Light baked fish with roasted vegetables and herbs',
                'low-carb': 'Protein-rich dinner with non-starchy vegetables',
                vegetarian: 'Hearty vegetable stir-fry with tofu',
                keto: 'Fatty fish with low-carb vegetables in olive oil',
                default: 'Healthy dinner for blood sugar stability'
            }
        };

        return descriptions[meal]?.[dietType] || descriptions[meal]?.default || 'Delicious and nutritious meal';
    };

    const getIngredients = (meal, preferences) => {
        const baseIngredients = {
            breakfast: ['eggs', 'spinach', 'olive oil', 'herbs'],
            lunch: ['chicken breast', 'mixed greens', 'olive oil', 'lemon'],
            dinner: ['salmon', 'asparagus', 'garlic', 'olive oil']
        };

        // Filter out allergies
        return baseIngredients[meal].filter(ing =>
            !preferences.allergies.includes(ing)
        );
    };

    const getMealTips = (meal, dietType) => {
        const tips = {
            breakfast: 'Eating protein at breakfast helps stabilize blood sugar all day',
            lunch: 'Include fiber-rich vegetables to slow glucose absorption',
            dinner: 'Finish dinner at least 3 hours before bed for better morning glucose'
        };
        return tips[meal];
    };

    const generateShoppingList = (preferences) => {
        const baseList = {
            produce: ['spinach', 'berries', 'avocados', 'lemons', 'garlic'],
            protein: ['chicken breast', 'salmon', 'eggs'],
            pantry: ['olive oil', 'quinoa', 'almonds', 'spices'],
            dairy: ['greek yogurt']
        };

        // Filter out allergies
        Object.keys(baseList).forEach(category => {
            baseList[category] = baseList[category].filter(item =>
                !preferences.allergies.some(allergy => item.includes(allergy))
            );
        });

        return baseList;
    };

    const generateTips = (preferences, selectedDiet) => {
        const baseTips = [
            `With ${selectedDiet?.name || 'your chosen'} diet, focus on whole, unprocessed foods`,
            'Monitor blood sugar 2 hours after meals to understand food impacts',
            'Include protein with every meal to stabilize blood glucose',
            `Aim for ${preferences.meals_per_day} evenly spaced meals throughout the day`,
            'Stay hydrated with 8-10 glasses of water daily',
            'Choose whole grains over refined carbohydrates when appropriate',
            'Practice portion control using smaller plates',
            'Keep a food diary to track what works best for you',
            "Don't skip meals - it can lead to blood sugar swings", // FIXED: Using double quotes for string with apostrophe
            'Pair carbohydrates with protein or fat to slow glucose absorption'
        ];

        // Add diet-specific tips
        if (preferences.diet_type === 'keto') {
            baseTips.push('Ensure adequate electrolyte intake (sodium, potassium, magnesium)');
            baseTips.push('Increase water intake to manage initial keto adaptation');
        }

        if (preferences.allergies.length > 0) {
            baseTips.push(`Remember to avoid: ${preferences.allergies.join(', ')}`);
        }

        return baseTips.slice(0, 8); // Return top 8 tips
    };

    // ============================================
    // UI HELPER FUNCTIONS
    // ============================================

    const toggleAllergy = (allergy) => {
        setPreferences(prev => ({
            ...prev,
            allergies: prev.allergies.includes(allergy)
                ? prev.allergies.filter(a => a !== allergy)
                : [...prev.allergies, allergy]
        }));
    };

    // ============================================
    // MEAL CARD COMPONENT
    // ============================================
    const MealCard = ({ meal, type }) => (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
        >
            <div className={`h-2 ${type === 'breakfast' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    type === 'lunch' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        type === 'dinner' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                            'bg-gradient-to-r from-purple-400 to-purple-500'
                }`} />

            <div className="p-5">
                {/* Meal Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{meal.image || '🍽️'}</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{meal.description}</p>
                        </div>
                    </div>
                    <Badge
                        variant={
                            meal.glycemic_index === 'low' || meal.glycemic_index === 'very low' ? 'success' : 'warning'
                        }
                        size="sm"
                    >
                        {meal.glycemic_index} GI
                    </Badge>
                </div>

                {/* Nutrition Facts */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Cal</p>
                        <p className="text-sm font-semibold text-gray-900">{meal.calories}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Protein</p>
                        <p className="text-sm font-semibold text-green-600">{meal.protein}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Carbs</p>
                        <p className="text-sm font-semibold text-orange-600">{meal.carbs}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Fat</p>
                        <p className="text-sm font-semibold text-blue-600">{meal.fat}g</p>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ing, idx) => (
                            <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Prep Time and Tips */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        {meal.prep_time} min prep
                    </div>
                    {meal.tips && (
                        <div className="group relative">
                            <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-primary-600 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {meal.tips}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    // ============================================
    // DIET TYPE CARD COMPONENT
    // ============================================
    const DietTypeCard = ({ diet, isSelected, onClick }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                    ? `border-${diet.color}-500 bg-${diet.color}-50`
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                }`}
        >
            {isSelected && (
                <div className={`absolute top-2 right-2 w-2 h-2 bg-${diet.color}-500 rounded-full animate-ping`} />
            )}

            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? `bg-${diet.color}-100` : 'bg-gray-100'
                    }`}>
                    <diet.icon className={`w-5 h-5 ${isSelected ? `text-${diet.color}-600` : 'text-gray-500'
                        }`} />
                </div>
                <span className={`font-semibold ${isSelected ? `text-${diet.color}-700` : 'text-gray-700'
                    }`}>
                    {diet.name}
                </span>
            </div>

            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{diet.description}</p>

            <div className="flex flex-wrap gap-1">
                {diet.benefits.slice(0, 2).map((benefit, idx) => (
                    <span key={idx} className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                        ✓ {benefit.substring(0, 20)}...
                    </span>
                ))}
            </div>
        </motion.button>
    );

    // ============================================
    // MAIN RENDER
    // ============================================
    return (
        <div className="space-y-6">
            {/* Header with Info Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Diet Planner</h2>
                    <p className="text-gray-500 mt-1">
                        Choose from {dietTypes.length}+ diet types for personalized meal plans
                    </p>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="About diet types"
                >
                    <InformationCircleIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Info Panel */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-blue-50 border-blue-200">
                            <h3 className="font-medium text-blue-800 mb-2">About Diet Types</h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Each diet type is tailored for specific health needs. Consider:
                            </p>
                            <ul className="space-y-1 text-sm text-blue-700">
                                <li>• <strong>Blood sugar control:</strong> Diabetes-Friendly, Low Carb, Mediterranean</li>
                                <li>• <strong>Heart health:</strong> DASH, Mediterranean, Low Sodium</li>
                                <li>• <strong>Weight loss:</strong> Keto, Low Carb, High Protein</li>
                                <li>• <strong>Digestive issues:</strong> Low FODMAP, Gluten-Free</li>
                                <li>• <strong>Ethical choices:</strong> Vegetarian, Vegan, Pescatarian</li>
                            </ul>
                            <p className="text-xs text-blue-600 mt-3">
                                Always consult your healthcare provider before starting any new diet.
                            </p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preferences Form */}
            <Card padding="lg" className="bg-gradient-to-br from-white to-primary-50">
                <div className="space-y-6">
                    {/* Diet Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Diet Type ({dietTypes.length} options)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                            {dietTypes.map(diet => (
                                <DietTypeCard
                                    key={diet.id}
                                    diet={diet}
                                    isSelected={preferences.diet_type === diet.id}
                                    onClick={() => setPreferences(prev => ({ ...prev, diet_type: diet.id }))}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Daily Targets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Calorie Target */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Daily Calories: <span className="text-primary-600">{preferences.calorie_target}</span>
                            </label>
                            <input
                                type="range"
                                min="1500"
                                max="3500"
                                step="50"
                                value={preferences.calorie_target}
                                onChange={(e) => setPreferences(prev => ({
                                    ...prev,
                                    calorie_target: parseInt(e.target.value)
                                }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1500</span>
                                <span>2500</span>
                                <span>3500</span>
                            </div>
                        </div>

                        {/* Meals per day */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Meals per day: <span className="text-primary-600">{preferences.meals_per_day}</span>
                            </label>
                            <div className="flex items-center gap-2">
                                {[2, 3, 4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setPreferences(prev => ({ ...prev, meals_per_day: num }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${preferences.meals_per_day === num
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Carbohydrate Target */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Carbohydrate Target
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {carbTargets.map(target => (
                                <button
                                    key={target.id}
                                    onClick={() => setPreferences(prev => ({ ...prev, carb_target: target.id }))}
                                    className={`p-3 rounded-xl border-2 transition-all text-center ${preferences.carb_target === target.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-200'
                                        }`}
                                >
                                    <p className={`text-xs font-medium ${preferences.carb_target === target.id ? 'text-primary-700' : 'text-gray-700'
                                        }`}>
                                        {target.name.split('(')[0]}
                                    </p>
                                    <Badge size="sm" variant={preferences.carb_target === target.id ? 'primary' : 'gray'}>
                                        {target.carbs}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergies & Sensitivities
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {commonAllergies.map(allergy => (
                                <button
                                    key={allergy}
                                    onClick={() => toggleAllergy(allergy)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${preferences.allergies.includes(allergy)
                                            ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-sm'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    {preferences.allergies.includes(allergy) ? '✓ ' : ''}{allergy}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateMealPlan}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Creating Your Personalized Meal Plan...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Generate My {dietTypes.find(d => d.id === preferences.diet_type)?.name} Meal Plan
                            </>
                        )}
                    </button>
                </div>
            </Card>

            {/* Loading State */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16"
                    >
                        <div className="relative">
                            <LoadingSpinner size="xl" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <span className="text-3xl">👨‍🍳</span>
                            </motion.div>
                        </div>
                        <p className="mt-6 text-lg font-medium text-gray-700">AI Chef is cooking your meal plan...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Meal Plan Results */}
            <AnimatePresence>
                {mealPlan && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Success Banner */}
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <CheckCircleIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Your {mealPlan.diet_type} Meal Plan is Ready! 🎉</h3>
                                    <p className="text-green-100 mt-1">
                                        {mealPlan.diet_description || `Personalized for your ${preferences.meals_per_day}-meal day`}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Nutrition Summary */}
                        <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Daily Calories</p>
                                    <p className="text-2xl font-bold text-primary-700">{mealPlan.calorie_target}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Carbs</p>
                                    <p className="text-2xl font-bold text-orange-600">{mealPlan.carb_target}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Meals</p>
                                    <p className="text-2xl font-bold text-green-600">{mealPlan.meals_per_day}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Diet Type</p>
                                    <p className="text-2xl font-bold text-blue-600">{mealPlan.diet_type}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Prep Time</p>
                                    <p className="text-2xl font-bold text-purple-600">~45min</p>
                                </div>
                            </div>
                        </Card>

                        {/* Meal Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Breakfast */}
                            {mealPlan.meals?.breakfast && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <SunIcon className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Breakfast Options</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {mealPlan.meals.breakfast.map((meal, idx) => (
                                            <MealCard key={idx} meal={meal} type="breakfast" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lunch */}
                            {mealPlan.meals?.lunch && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <SunIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Lunch Options</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {mealPlan.meals.lunch.map((meal, idx) => (
                                            <MealCard key={idx} meal={meal} type="lunch" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dinner */}
                            {mealPlan.meals?.dinner && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <MoonIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Dinner Options</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {mealPlan.meals.dinner.map((meal, idx) => (
                                            <MealCard key={idx} meal={meal} type="dinner" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Snacks */}
                            {mealPlan.meals?.snacks && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <SparklesIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Healthy Snacks</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {mealPlan.meals.snacks.map((meal, idx) => (
                                            <MealCard key={idx} meal={meal} type="snack" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shopping List */}
                        {mealPlan.shopping_list && (
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-center gap-2 mb-6">
                                    <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                                    <h3 className="text-xl font-semibold text-gray-900">Shopping List</h3>
                                    <Badge variant="success" size="md" className="ml-auto">
                                        {Object.values(mealPlan.shopping_list).flat().length} items
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {Object.entries(mealPlan.shopping_list).map(([category, items]) => (
                                        <div key={category}>
                                            <h4 className="font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                                            <div className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                                                        <input type="checkbox" className="rounded text-green-600" />
                                                        <span className="text-sm text-gray-700">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Tips */}
                        {mealPlan.tips && (
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Expert Tips for Your {mealPlan.diet_type} Diet</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {mealPlan.tips.map((tip, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-primary-600 font-bold">{idx + 1}.</span>
                                            <p className="text-sm text-gray-700">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Glycemic Index Guide */}
                        {mealPlan.glycemic_guide && (
                            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Glycemic Index Guide for Diabetes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <p className="font-medium text-green-800 mb-2">Low GI (Best)</p>
                                        <ul className="space-y-1">
                                            {mealPlan.glycemic_guide.low.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <p className="font-medium text-yellow-800 mb-2">Medium GI</p>
                                        <ul className="space-y-1">
                                            {mealPlan.glycemic_guide.medium.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <p className="font-medium text-red-800 mb-2">High GI (Limit)</p>
                                        <ul className="space-y-1">
                                            {mealPlan.glycemic_guide.high.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Regenerate Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={generateMealPlan}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-primary-600 text-primary-700 font-medium rounded-xl hover:bg-primary-50 transition-all shadow-md hover:shadow-lg"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Generate New Meal Plan
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!mealPlan && !loading && (
                <Card className="py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md mx-auto"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse"></div>
                            <div className="absolute inset-2 bg-primary-200 rounded-full"></div>
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                                <HeartIcon className="w-12 h-12 text-primary-600" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Ready for Your Personalized Meal Plan?
                        </h3>

                        <p className="text-gray-500 mb-6">
                            Choose from {dietTypes.length}+ diet types above and our AI will create a
                            diabetes-friendly meal plan tailored just for you.
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="p-3 bg-primary-50 rounded-xl">
                                <span className="block text-2xl mb-1">🥗</span>
                                <span className="text-xs text-primary-700">Personalized</span>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-xl">
                                <span className="block text-2xl mb-1">📊</span>
                                <span className="text-xs text-primary-700">Tracked</span>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-xl">
                                <span className="block text-2xl mb-1">✨</span>
                                <span className="text-xs text-primary-700">AI-Powered</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-6">
                            Powered by OpenRouter AI • Diabetes-friendly • Always consult your doctor
                        </p>
                    </motion.div>
                </Card>
            )}
        </div>
    );
};

export default DietPlanner;