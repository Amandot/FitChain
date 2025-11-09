import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './UserProfile.css';

const UserProfile = ({ onComplete, onSkip }) => {
    const [formData, setFormData] = useState({
        username: '',
        age: '',
        gender: '',
        fitnessLevel: '',
        goals: '',
        country: '',
        acceptTerms: false
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else if (parseInt(formData.age) < 13) {
            newErrors.age = 'You must be at least 13 years old';
        } else if (parseInt(formData.age) > 120) {
            newErrors.age = 'Please enter a valid age';
        }

        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.fitnessLevel) {
            newErrors.fitnessLevel = 'Please select your fitness level';
        }

        if (!formData.goals) {
            newErrors.goals = 'Please select your fitness goals';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep2()) {
            // Check age eligibility for contests
            const age = parseInt(formData.age);
            if (age < 18) {
                alert('Sorry, you must be 18 or older to participate in contests. You can still use the fitness tracking features!');
                return;
            }

            onComplete({
                ...formData,
                age: parseInt(formData.age),
                createdAt: new Date().toISOString(),
                profileComplete: true
            });
        }
    };

    const ageCategories = [
        { range: '18-25', label: 'Young Adults (18-25)', description: 'High-energy challenges' },
        { range: '26-35', label: 'Active Adults (26-35)', description: 'Balanced fitness goals' },
        { range: '36-50', label: 'Prime Adults (36-50)', description: 'Sustainable wellness' },
        { range: '50+', label: 'Mature Adults (50+)', description: 'Gentle fitness journey' }
    ];

    const getAgeCategory = (age) => {
        if (age >= 18 && age <= 25) return ageCategories[0];
        if (age >= 26 && age <= 35) return ageCategories[1];
        if (age >= 36 && age <= 50) return ageCategories[2];
        if (age >= 51) return ageCategories[3];
        return null;
    };

    const currentAgeCategory = formData.age ? getAgeCategory(parseInt(formData.age)) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="user-profile-modal"
        >
            <div className="profile-card">
                <div className="profile-header">
                    <h2>Create Your Profile</h2>
                    <p>Join age-appropriate contests and earn exclusive rewards</p>
                    <div className="step-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="form-step"
                        >
                            <h3>Basic Information</h3>

                            <div className="form-group">
                                <label htmlFor="username">Username *</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                    className={errors.username ? 'error' : ''}
                                />
                                {errors.username && <span className="error-text">{errors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age *</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="Enter your age"
                                    min="13"
                                    max="120"
                                    className={errors.age ? 'error' : ''}
                                />
                                {errors.age && <span className="error-text">{errors.age}</span>}
                                {currentAgeCategory && (
                                    <div className="age-category-info">
                                        <span className="category-badge">{currentAgeCategory.label}</span>
                                        <p>{currentAgeCategory.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender *</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className={errors.gender ? 'error' : ''}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                                {errors.gender && <span className="error-text">{errors.gender}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="country">Country (Optional)</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="Enter your country"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={onSkip} className="skip-button">
                                    Skip for now
                                </button>
                                <button type="button" onClick={handleNext} className="next-button">
                                    Next Step →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="form-step"
                        >
                            <h3>Fitness Preferences</h3>

                            <div className="form-group">
                                <label htmlFor="fitnessLevel">Current Fitness Level *</label>
                                <select
                                    id="fitnessLevel"
                                    name="fitnessLevel"
                                    value={formData.fitnessLevel}
                                    onChange={handleInputChange}
                                    className={errors.fitnessLevel ? 'error' : ''}
                                >
                                    <option value="">Select fitness level</option>
                                    <option value="beginner">Beginner - Just starting out</option>
                                    <option value="intermediate">Intermediate - Regular exercise</option>
                                    <option value="advanced">Advanced - Very active lifestyle</option>
                                    <option value="athlete">Athlete - Competitive level</option>
                                </select>
                                {errors.fitnessLevel && <span className="error-text">{errors.fitnessLevel}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="goals">Primary Fitness Goals *</label>
                                <select
                                    id="goals"
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleInputChange}
                                    className={errors.goals ? 'error' : ''}
                                >
                                    <option value="">Select your goals</option>
                                    <option value="weight-loss">Weight Loss</option>
                                    <option value="muscle-gain">Muscle Gain</option>
                                    <option value="endurance">Build Endurance</option>
                                    <option value="general-health">General Health</option>
                                    <option value="competition">Competition Training</option>
                                    <option value="rehabilitation">Rehabilitation</option>
                                </select>
                                {errors.goals && <span className="error-text">{errors.goals}</span>}
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkmark"></span>
                                    I accept the <a href="#" target="_blank">Terms & Conditions</a> and <a href="#" target="_blank">Privacy Policy</a> *
                                </label>
                                {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
                            </div>

                            {parseInt(formData.age) < 18 && (
                                <div className="age-warning">
                                    <span className="warning-icon">⚠️</span>
                                    <p>You must be 18 or older to participate in contests. You can still use all fitness tracking features!</p>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" onClick={() => setStep(1)} className="back-button">
                                    ← Back
                                </button>
                                <button type="submit" className="submit-button">
                                    {parseInt(formData.age) >= 18 ? 'Join Contests!' : 'Create Profile'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>
        </motion.div>
    );
};

export default UserProfile;