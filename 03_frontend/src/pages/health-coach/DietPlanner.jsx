import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    SunIcon,
    MoonIcon,
    SparklesIcon,
    HeartIcon,
    ClockIcon,
    FireIcon,
} from '@heroicons/react/24/outline';

const DietPlanner = () => {
    const [selectedDay, setSelectedDay] = useState('monday');
    const [dietPreferences, setDietPreferences] = useState({
        calories: 2000,
        carbs: 50,
        protein: 30,
        fat: 20,
        restrictions: [],
    });

    const mealPlans = {
        monday: {
            breakfast: {
                name: "Greek Yogurt with Berries",
                calories: 320,
                carbs: 35,
                protein: 20,
                fat: 12,
                ingredients: ["Greek yogurt", "Mixed berries", "Honey", "Almonds"],
                prepTime: "5 min",
            },
            lunch: {
                name: "Grilled Chicken Salad",
                calories: 450,
                carbs: 25,
                protein: 40,
                fat: 22,
                ingredients: ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil"],
                prepTime: "15 min",
            },
            dinner: {
                name: "Baked Salmon with Vegetables",
                calories: 550,
                carbs: 30,
                protein: 45,
                fat: 28,
                ingredients: ["Salmon fillet", "Broccoli", "Sweet potato", "Lemon", "Herbs"],
                prepTime: "25 min",
            },
            snacks: [
                {
                    name: "Apple with Peanut Butter",
                    calories: 200,
                    prepTime: "2 min",
                },
                {
                    name: "Handful of Almonds",
                    calories: 160,
                    prepTime: "1 min",
                },
            ],
        },
        tuesday: {
            breakfast: {
                name: "Oatmeal with Banana",
                calories: 350,
                carbs: 55,
                protein: 12,
                fat: 8,
                ingredients: ["Rolled oats", "Banana", "Cinnamon", "Walnuts"],
                prepTime: "10 min",
            },
            lunch: {
                name: "Turkey Wrap",
                calories: 420,
                carbs: 40,
                protein: 35,
                fat: 18,
                ingredients: ["Turkey breast", "Whole wheat wrap", "Lettuce", "Tomato", "Avocado"],
                prepTime: "10 min",
            },
            dinner: {
                name: "Quinoa Bowl with Roasted Vegetables",
                calories: 480,
                carbs: 65,
                protein: 15,
                fat: 16,
                ingredients: ["Quinoa", "Bell peppers", "Zucchini", "Chickpeas", "Tahini sauce"],
                prepTime: "20 min",
            },
            snacks: [
                {
                    name: "Greek Yogurt",
                    calories: 150,
                    prepTime: "1 min",
                },
                {
                    name: "Carrot Sticks with Hummus",
                    calories: 180,
                    prepTime: "5 min",
                },
            ],
        },
    };

    const days = [
        { id: 'monday', name: 'Monday' },
        { id: 'tuesday', name: 'Tuesday' },
        { id: 'wednesday', name: 'Wednesday' },
        { id: 'thursday', name: 'Thursday' },
        { id: 'friday', name: 'Friday' },
        { id: 'saturday', name: 'Saturday' },
        { id: 'sunday', name: 'Sunday' },
    ];

    const currentMealPlan = mealPlans[selectedDay] || mealPlans.monday;

    const totalCalories =
        currentMealPlan.breakfast.calories +
        currentMealPlan.lunch.calories +
        currentMealPlan.dinner.calories +
        currentMealPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Personalized Diet Planner</h2>
                    <p className="text-sm text-gray-600">Healthy meal plans tailored for diabetes management</p>
                </div>
                <button className="btn-primary flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Generate New Plan</span>
                </button>
            </div>

            {/* Macros Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <FireIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-600">Daily Target</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{totalCalories}</p>
                    <p className="text-xs text-blue-600">Calories</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-green-700">{currentMealPlan.breakfast.carbs + currentMealPlan.lunch.carbs + currentMealPlan.dinner.carbs}g</p>
                    <p className="text-xs text-green-600">45-65% of calories</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Protein</p>
                    <p className="text-2xl font-bold text-purple-700">{currentMealPlan.breakfast.protein + currentMealPlan.lunch.protein + currentMealPlan.dinner.protein}g</p>
                    <p className="text-xs text-purple-600">15-25% of calories</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 mb-1">Fat</p>
                    <p className="text-2xl font-bold text-yellow-700">{currentMealPlan.breakfast.fat + currentMealPlan.lunch.fat + currentMealPlan.dinner.fat}g</p>
                    <p className="text-xs text-yellow-600">20-35% of calories</p>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {days.map((day) => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {day.name}
                    </button>
                ))}
            </div>

            {/* Meal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
                >
                    <div className="flex items-center space-x-2 mb-3">
                        <SunIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900">Breakfast</h3>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{currentMealPlan.breakfast.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{currentMealPlan.breakfast.prepTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FireIcon className="w-4 h-4" />
                            <span>{currentMealPlan.breakfast.calories} calories</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Ingredients:</p>
                        <ul className="list-disc list-inside">
                            {currentMealPlan.breakfast.ingredients.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Lunch */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
                >
                    <div className="flex items-center space-x-2 mb-3">
                        <SunIcon className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">Lunch</h3>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{currentMealPlan.lunch.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{currentMealPlan.lunch.prepTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FireIcon className="w-4 h-4" />
                            <span>{currentMealPlan.lunch.calories} calories</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Ingredients:</p>
                        <ul className="list-disc list-inside">
                            {currentMealPlan.lunch.ingredients.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Dinner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
                >
                    <div className="flex items-center space-x-2 mb-3">
                        <MoonIcon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-gray-900">Dinner</h3>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{currentMealPlan.dinner.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{currentMealPlan.dinner.prepTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FireIcon className="w-4 h-4" />
                            <span>{currentMealPlan.dinner.calories} calories</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Ingredients:</p>
                        <ul className="list-disc list-inside">
                            {currentMealPlan.dinner.ingredients.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>

            {/* Snacks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
            >
                <h3 className="font-semibold text-gray-900 mb-3">Healthy Snacks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMealPlan.snacks.map((snack, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{snack.name}</p>
                                <p className="text-sm text-gray-500">{snack.prepTime} • {snack.calories} cal</p>
                            </div>
                            <HeartIcon className="w-5 h-5 text-green-500" />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-primary-50 rounded-lg p-4"
            >
                <h4 className="font-medium text-primary-800 mb-2">💡 Diabetes Diet Tips</h4>
                <ul className="space-y-2 text-sm text-primary-700">
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Eat meals at regular times to maintain stable blood sugar</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Include fiber-rich foods in every meal</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Stay hydrated - drink water instead of sugary drinks</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Monitor portion sizes using the plate method</span>
                    </li>
                </ul>
            </motion.div>
        </div>
    );
};

export default DietPlanner;