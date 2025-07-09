import React, { useState, useEffect, useCallback } from 'react';
import { Coins, Download, Share2, Calendar, DollarSign, Percent, FileText, Send, Copy, Mail, Image, Smartphone, Monitor, Tablet, Clock, TrendingUp, Info, Scale, Gem } from 'lucide-react';
import { format } from 'date-fns';

const GoldSilverCalculator = () => {
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [rate, setRate] = useState('');
  const [grams, setGrams] = useState('');
  const [wastage, setWastage] = useState('5');
  const [customWastage, setCustomWastage] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [finalAmount, setFinalAmount] = useState<string | null>(null);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [includeSteps, setIncludeSteps] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const calculateTotal = useCallback(() => {
    if (!rate || !grams || !makingCharge) {
      setFinalAmount(null);
      setCalculationSteps([]);
      return;
    }

    setIsCalculating(true);

    const rateValue = parseFloat(rate);
    const gramsValue = parseFloat(grams);
    const makingChargeValue = parseFloat(makingCharge);

    let wastageValue = parseFloat(wastage) / 100;
    if (wastage === 'custom') {
      wastageValue = parseFloat(customWastage) / 100;
    }

    if (
      isNaN(rateValue) ||
      isNaN(gramsValue) ||
      isNaN(makingChargeValue) ||
      isNaN(wastageValue) ||
      wastageValue < 0 ||
      wastageValue > 1
    ) {
      setFinalAmount(null);
      setCalculationSteps([]);
      setIsCalculating(false);
      return;
    }

    const perGramRate = rateValue / (selectedMetal === 'gold' ? 8 : 10);
    const updatedGrams = gramsValue * (1 + wastageValue);
    const updatedCost = updatedGrams * perGramRate;
    const totalAmount = updatedCost + makingChargeValue;

    setFinalAmount(totalAmount.toFixed(2));

    const newSteps = [
      `💎 Metal Type: ${selectedMetal === 'gold' ? 'Gold' : 'Silver'}`,
      `📊 Rate per ${selectedMetal === 'gold' ? '8 grams' : '10 grams'}: ₹${rateValue.toLocaleString()}`,
      `⚖️ Per Gram Rate: ₹${perGramRate.toFixed(2)}`,
      `📏 Weight: ${gramsValue}g`,
      `📈 Wastage: ${(wastageValue * 100).toFixed(1)}%`,
      `⚖️ Updated Weight (including wastage): ${updatedGrams.toFixed(2)}g`,
      `💰 Metal Cost: ${updatedGrams.toFixed(2)}g × ₹${perGramRate.toFixed(2)} = ₹${updatedCost.toLocaleString()}`,
      `🔨 Making Charge: ₹${makingChargeValue.toLocaleString()}`,
      `🎯 Total Amount: ₹${totalAmount.toLocaleString()}`
    ];

    setCalculationSteps(newSteps);
    setIsCalculating(false);
  }, [selectedMetal, rate, grams, wastage, customWastage, makingCharge]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateTotal();
    }, 300);
    return () => clearTimeout(timer);
  }, [calculateTotal]);

  const generatePDF = async () => {
    if (!finalAmount) {
      alert('Please complete the calculation before generating a PDF.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header with gradient effect
      doc.setFillColor(255, 193, 7);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('💎 Balaji Jewellery BJR - Rate Calculator', 20, 20);

      // Company info section
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')} | Balaji Jewellery BJR`, 20, 40);

      // Summary box with border
      doc.setDrawColor(255, 193, 7);
      doc.setLineWidth(1);
      doc.rect(15, 50, 180, 80);
      
      doc.setFillColor(255, 248, 220);
      doc.rect(15, 50, 180, 80, 'F');

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('CALCULATION SUMMARY', 20, 60);

      doc.setFontSize(11);
      doc.text(`Metal Type: ${selectedMetal === 'gold' ? 'Gold' : 'Silver'}`, 20, 75);
      doc.text(`Rate: Rs.${parseFloat(rate).toLocaleString()} per ${selectedMetal === 'gold' ? '8 grams' : '10 grams'}`, 20, 85);
      doc.text(`Weight: ${grams}g`, 20, 95);
      doc.text(`Wastage: ${wastage === 'custom' ? customWastage : wastage}%`, 20, 105);
      doc.text(`Making Charge: Rs.${parseFloat(makingCharge).toLocaleString()}`, 20, 115);

      // Results section
      doc.setFillColor(34, 197, 94);
      doc.rect(15, 140, 180, 30, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL AMOUNT', 20, 155);
      
      doc.setFontSize(14);
      doc.text(`Rs.${parseFloat(finalAmount).toLocaleString()}`, 20, 165);

      // Steps section
      if (calculationSteps.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('DETAILED CALCULATION STEPS', 20, 185);
        
        doc.setFontSize(10);
        let yPosition = 195;
        calculationSteps.forEach((step, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          // Clean the step text by removing emojis and special characters
          const cleanStep = step.replace(/[^\w\s₹.,:()\-]/g, '').replace(/₹/g, 'Rs.').trim();
          doc.text(`${index + 1}. ${cleanStep}`, 20, yPosition);
          yPosition += 8;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} | Balaji Jewellery BJR`, 20, doc.internal.pageSize.height - 10);
      }

      // Generate PDF and show sharing options immediately
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.pdf`, { type: 'application/pdf' });
      
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            title: 'Rate Calculation - Balaji Jewellery BJR',
            text: 'Rate calculation from Balaji Jewellery BJR',
            files: [pdfFile]
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            // Fallback to download if sharing fails
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            link.click();
            URL.revokeObjectURL(pdfUrl);
          }
        }
      } else {
        // Fallback: show download and then sharing modal
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        link.click();
        URL.revokeObjectURL(pdfUrl);
      }
      
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateImage = async () => {
    if (!finalAmount) {
      alert('Please complete the calculation before generating an image.');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a comprehensive summary element for image generation
      const summaryElement = document.createElement('div');
      summaryElement.style.cssText = `
        background: white;
        padding: 30px;
        font-family: Arial, sans-serif;
        width: 600px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      
      summaryElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #f59e0b; padding-bottom: 15px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: bold;">Balaji Jewellery BJR</h1>
          <h2 style="color: #6b7280; margin: 5px 0 0 0; font-size: 18px;">Gold/Silver Rate Calculator</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: bold;">CALCULATION SUMMARY</h3>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #374151;"><strong>Metal Type:</strong> ${selectedMetal === 'gold' ? 'Gold' : 'Silver'}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Rate:</strong> Rs.${parseFloat(rate).toLocaleString()} per ${selectedMetal === 'gold' ? '8 grams' : '10 grams'}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Weight:</strong> ${grams}g</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Wastage:</strong> ${wastage === 'custom' ? customWastage : wastage}%</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Making Charge:</strong> Rs.${parseFloat(makingCharge).toLocaleString()}</p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #166534; font-size: 20px;"><strong>Total Amount: Rs.${parseFloat(finalAmount).toLocaleString()}</strong></p>
          </div>
        </div>
        
        ${calculationSteps.length > 0 ? `
          <div>
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: bold;">CALCULATION STEPS</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 12px;">
              ${calculationSteps.map((step, index) => {
                const cleanStep = step.replace(/[^\w\s₹.,:()\-]/g, '').replace(/₹/g, 'Rs.').trim();
                return `<p style="margin: 3px 0; color: #374151;">${index + 1}. ${cleanStep}</p>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} | Balaji Jewellery BJR
        </div>
      `;
      
      document.body.appendChild(summaryElement);
      
      const canvas = await html2canvas(summaryElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        width: 600,
        height: summaryElement.scrollHeight
      });
      
      document.body.removeChild(summaryElement);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const imageFile = new File([blob], `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.png`, { type: 'image/png' });
          
          // Check if Web Share API is supported
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            try {
              await navigator.share({
                title: 'Rate Calculation - Balaji Jewellery BJR',
                text: 'Rate calculation from Balaji Jewellery BJR',
                files: [imageFile]
              });
            } catch (error) {
              if (error.name !== 'AbortError') {
                // Fallback to download if sharing fails
                const link = document.createElement('a');
                link.download = `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.png`;
                link.href = canvas.toDataURL();
                link.click();
              }
            }
          } else {
            // Fallback: download the image
            const link = document.createElement('a');
            link.download = `Balaji_Jewellery_Rate_${format(new Date(), 'yyyy-MM-dd')}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        }
      }, 'image/png');
        
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getShareText = () => {
    const baseText = `💎 *Balaji Jewellery BJR - Rate Calculation*\n\n` +
      `⚖️ *Metal:* ${selectedMetal === 'gold' ? 'Gold' : 'Silver'}\n` +
      `📊 *Rate:* Rs.${parseFloat(rate).toLocaleString()} per ${selectedMetal === 'gold' ? '8 grams' : '10 grams'}\n` +
      `📏 *Weight:* ${grams}g\n` +
      `📈 *Wastage:* ${wastage === 'custom' ? customWastage : wastage}%\n` +
      `🔨 *Making Charge:* Rs.${parseFloat(makingCharge).toLocaleString()}\n\n` +
      `💰 *Total Amount:* Rs.${parseFloat(finalAmount || '0').toLocaleString()}`;

    if (calculationSteps.length > 0) {
      const cleanSteps = calculationSteps.map((step, index) => {
        const cleanStep = step.replace(/[^\w\s₹.,:()\-]/g, '').replace(/₹/g, 'Rs.').trim();
        return `${index + 1}. ${cleanStep}`;
      }).join('\n');
      return baseText + '\n\n📝 *Calculation Steps:*\n' + cleanSteps;
    }
    
    return baseText;
  };

  const shareViaWhatsApp = () => {
    const message = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Rate Calculation - Balaji Jewellery BJR';
    const body = getShareText();
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const copyToClipboard = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('❌ Failed to copy to clipboard');
    }
  };

  const resetForm = () => {
    setSelectedMetal('gold');
    setRate('');
    setGrams('');
    setWastage('5');
    setCustomWastage('');
    setMakingCharge('');
    setFinalAmount(null);
    setCalculationSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center items-center mb-4">
            <Coins className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 text-amber-600 mr-2 sm:mr-3" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Balaji Jewellery BJR</h1>
              <p className="text-lg sm:text-xl text-amber-600 font-semibold">Gold/Silver Rate Calculator</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Professional Jewelry Pricing Tool</p>
          <div className="flex justify-center items-center mt-2 space-x-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <Scale className="w-4 h-4 mr-1" />
              <span>Accurate Rates</span>
            </div>
            <div className="flex items-center">
              <Gem className="w-4 h-4 mr-1" />
              <span>Professional</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-amber-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mr-2" />
              Calculation Parameters
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Metal Selection */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Gem className="w-4 h-4 mr-1" />
                  Select Metal *
                </label>
                <select
                  value={selectedMetal}
                  onChange={(e) => setSelectedMetal(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>

              {/* Rate */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per {selectedMetal === 'gold' ? '8 grams' : '10 grams'} (₹) *
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                  placeholder={`Enter rate per ${selectedMetal === 'gold' ? '8 grams' : '10 grams'}`}
                />
              </div>

              {/* Weight */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Scale className="w-4 h-4 mr-1" />
                  Weight in Grams *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter weight in grams"
                />
              </div>

              {/* Wastage */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Wastage Percentage *
                </label>
                <select
                  value={wastage}
                  onChange={(e) => setWastage(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                >
                  {[...Array(16).keys()].map((i) => (
                    <option key={i + 5} value={(i + 5).toString()}>
                      {i + 5}%
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                {wastage === 'custom' && (
                  <input
                    type="number"
                    step="0.1"
                    value={customWastage}
                    onChange={(e) => setCustomWastage(e.target.value)}
                    className="w-full mt-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter custom wastage percentage"
                  />
                )}
              </div>

              {/* Making Charge */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Making Charge (₹) *
                </label>
                <input
                  type="number"
                  value={makingCharge}
                  onChange={(e) => setMakingCharge(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter making charge"
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={resetForm}
                className="w-full bg-gray-500 text-white px-4 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                🔄 Reset Form
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-amber-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mr-2" />
              Calculation Results
            </h2>

            {isCalculating ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : finalAmount ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                <div id="goldsilver-summary" className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-700 font-medium text-sm sm:text-base">Metal Type</span>
                      <span className="text-lg sm:text-xl font-bold text-amber-800 capitalize">{selectedMetal}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium text-sm sm:text-base">Total Amount</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-800">₹{parseFloat(finalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium text-sm sm:text-base">Weight</span>
                      <span className="text-sm sm:text-lg font-semibold text-blue-800">{grams}g</span>
                    </div>
                  </div>
                </div>

                {/* Share Options */}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 sm:py-3 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isGeneratingPDF ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    )}
                    PDF
                  </button>
                  <button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 sm:py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isGeneratingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    )}
                    Image
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 sm:py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 sm:py-3 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    More
                  </button>
                </div>

                {/* Calculation Steps */}
                {calculationSteps.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Calculation Steps
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-60 overflow-y-auto">
                      <ol className="space-y-1 sm:space-y-2">
                        {calculationSteps.map((step, index) => (
                          <li key={index} className="text-xs sm:text-sm text-gray-700 flex items-start">
                            <span className="text-amber-600 font-medium mr-2 min-w-fit text-xs sm:text-sm">
                              {index + 1}.
                            </span>
                            <span className="break-words">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Coins className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" />
                <p className="text-center text-sm sm:text-base">Enter all required fields to begin calculation</p>
              </div>
            )}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full mx-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mr-2" />
                Share Results
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Choose how you'd like to share your calculation:</p>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="w-full bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Share via WhatsApp
                </button>
                <button
                  onClick={shareViaEmail}
                  className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Share via Email
                </button>
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Copy to Clipboard
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-3 sm:mt-4 bg-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoldSilverCalculator;