import React, { useState } from 'react';
import { Calculator, Coins, ArrowLeft, Gem, TrendingUp, Scale } from 'lucide-react';
import InterestCalculator from './InterestCalculator';
import GoldSilverCalculator from './GoldSilverCalculator';

const MainCalculator = () => {
  const [selectedCalculator, setSelectedCalculator] = useState<'menu' | 'interest' | 'goldsilver'>('menu');

  const calculatorOptions = [
    {
      id: 'interest',
      title: 'Interest Calculator',
      description: 'Calculate simple and compound interest for jewelry loans',
      icon: Calculator,
      color: 'from-amber-500 to-orange-500',
      features: ['Simple & Compound Interest', 'PDF Generation', 'WhatsApp Sharing', 'Detailed Steps']
    },
    {
      id: 'goldsilver',
      title: 'Gold/Silver Rate Calculator',
      description: 'Calculate jewelry pricing with wastage and making charges',
      icon: Coins,
      color: 'from-yellow-500 to-amber-500',
      features: ['Gold & Silver Rates', 'Wastage Calculation', 'Making Charges', 'Bill Generation']
    }
  ];

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Gem className="w-16 h-16 text-amber-600 mr-4" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Balaji Jewellery BJR
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">Professional Jewelry Shop Calculator Suite</p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Interest Calculations</span>
            </div>
            <div className="flex items-center">
              <Scale className="w-4 h-4 mr-1" />
              <span>Rate Calculations</span>
            </div>
            <div className="flex items-center">
              <Gem className="w-4 h-4 mr-1" />
              <span>Professional Tools</span>
            </div>
          </div>
        </div>

        {/* Calculator Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {calculatorOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedCalculator(option.id as 'interest' | 'goldsilver')}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-6`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{option.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{option.description}</p>
                
                <div className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full bg-gradient-to-r ${option.color} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center`}>
                  <span>Open Calculator</span>
                  <IconComponent className="w-5 h-5 ml-2" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Why Choose Our Calculator Suite?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Accurate Calculations</h3>
              <p className="text-gray-600">Precise interest and rate calculations with detailed step-by-step breakdowns</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional Reports</h3>
              <p className="text-gray-600">Generate professional PDFs and share via WhatsApp, email, or other platforms</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Sharing</h3>
              <p className="text-gray-600">Share calculations instantly with customers via multiple channels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalculator = () => {
    return (
      <div className="min-h-screen">
        {/* Back Button */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
          <button
            onClick={() => setSelectedCalculator('menu')}
            className="flex items-center text-white hover:text-amber-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Calculator Menu</span>
          </button>
        </div>

        {/* Calculator Component */}
        {selectedCalculator === 'interest' && <InterestCalculator />}
        {selectedCalculator === 'goldsilver' && <GoldSilverCalculator />}
      </div>
    );
  };

  return selectedCalculator === 'menu' ? renderMenu() : renderCalculator();
};

export default MainCalculator;