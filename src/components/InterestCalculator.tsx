import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator, Download, Share2, Calendar, DollarSign, Percent, FileText,
  Send, Copy, Mail, Image as ImageIcon, Smartphone, Monitor, Tablet, Clock,
  TrendingUp, Info
} from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

const InterestCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('2');
  const [customRate, setCustomRate] = useState('');
  const [noticeCharge, setNoticeCharge] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [interest, setInterest] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState('');
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [steps, setSteps] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accept multiple manual formats AND native date input value
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const formats = [
      'yyyy-MM-dd', // native input
      'dd-MM-yyyy',
      'dd/MM/yyyy',
      'dd.MM.yyyy',
      'dd-MM-yy',
      'dd/MM/yy',
    ];

    for (const fmt of formats) {
      try {
        const d = parse(dateString, fmt, new Date());
        if (isValid(d)) return d;
      } catch {
        // keep trying
      }
    }
    // Fallback (ISO, etc.)
    const iso = new Date(dateString);
    return isValid(iso) ? iso : null;
  };

  const calculateInterest = useCallback(() => {
    setError(null);

    if (!principal || !startDate) {
      setInterest(null);
      setFinalAmount(null);
      setTimePeriod('');
      setSteps([]);
      return;
    }

    const effectivePrincipal = parseFloat(principal);
    if (!Number.isFinite(effectivePrincipal) || effectivePrincipal <= 0) {
      setError('Please enter a valid principal greater than 0.');
      setInterest(null);
      setFinalAmount(null);
      setTimePeriod('');
      setSteps([]);
      return;
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
      setError('Please enter valid start and end dates (e.g., 31-10-2025 or 31/10/2025).');
      setInterest(null);
      setFinalAmount(null);
      setTimePeriod('');
      setSteps([]);
      return;
    }

    if (end < start) {
      setError('End date must be on or after the start date.');
      setInterest(null);
      setFinalAmount(null);
      setTimePeriod('');
      setSteps([]);
      return;
    }

    const monthlyRateRaw = rate === 'custom' ? parseFloat(customRate) : parseFloat(rate);
    if (!Number.isFinite(monthlyRateRaw) || monthlyRateRaw <= 0) {
      setError('Please enter a valid monthly interest rate.');
      setInterest(null);
      setFinalAmount(null);
      setTimePeriod('');
      setSteps([]);
      return;
    }
    const monthlyRate = monthlyRateRaw / 100;

    setIsCalculating(true);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const totalMonths = years * 12 + months;
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)); // kept for reference
    setTimePeriod(`${years} years, ${months} months, ${days} days`);

    let calculatedInterest = 0;
    const newSteps: string[] = [];

    newSteps.push(`📊 Principal Amount: ₹${effectivePrincipal.toLocaleString()}`);
    newSteps.push(`📈 Monthly Interest Rate: ${monthlyRate * 100}%`);
    newSteps.push(`⚙️ Interest Type: ${interestType === 'simple' ? 'Simple Interest' : 'Compound Interest'}`);
    newSteps.push(`⏰ Time Period: ${years} years, ${months} months, ${days} days`);
    newSteps.push(`📅 From: ${format(start, 'dd MMM yyyy')} to ${format(end, 'dd MMM yyyy')}`);

    const noticeNum = parseFloat(noticeCharge);
    const noticeSafe = Number.isFinite(noticeNum) && noticeNum > 0 ? noticeNum : 0;

    if (interestType === 'simple') {
      const simpleInterest = effectivePrincipal * monthlyRate * totalMonths;
      const remainingInterest = (effectivePrincipal * monthlyRate / 30) * days;
      calculatedInterest = simpleInterest + remainingInterest;

      const finalAmountValue = effectivePrincipal + calculatedInterest + noticeSafe;

      newSteps.push(`💰 Simple Interest for ${totalMonths} months: ₹${simpleInterest.toLocaleString()}`);
      if (days > 0) {
        newSteps.push(`📆 Interest for remaining ${days} days: ₹${remainingInterest.toFixed(2)}`);
      }
      if (noticeSafe > 0) {
        newSteps.push(`📋 Notice Charge: ₹${noticeSafe.toLocaleString()}`);
      }
      newSteps.push(`🎯 Total Interest: ₹${calculatedInterest.toLocaleString()}`);
      newSteps.push(`💎 Final Amount: ₹${finalAmountValue.toLocaleString()}`);

      setInterest(calculatedInterest.toFixed(2));
      setFinalAmount(finalAmountValue.toFixed(2));
    } else {
      // compound (semi-annual compounding as per your logic)
      let remainingMonths = totalMonths;
      let remainingDays = days;
      let totalInterest = 0;
      let currentPrincipal = effectivePrincipal;
      let compoundPeriod = 1;

      while (remainingMonths >= 6) {
        const periodInterest = currentPrincipal * monthlyRate * 6;
        totalInterest += periodInterest;
        currentPrincipal += periodInterest;
        remainingMonths -= 6;

        newSteps.push(`🔄 Period ${compoundPeriod} (6 months): ₹${periodInterest.toLocaleString()}`);
        newSteps.push(`📊 Updated Principal: ₹${currentPrincipal.toLocaleString()}`);
        compoundPeriod++;
      }

      if (remainingMonths > 0) {
        const remainingMonthsInterest = currentPrincipal * monthlyRate * remainingMonths;
        totalInterest += remainingMonthsInterest;
        newSteps.push(`📅 Interest for remaining ${remainingMonths} months: ₹${remainingMonthsInterest.toLocaleString()}`);
      }

      if (remainingDays > 0) {
        const remainingDaysInterest = (currentPrincipal * monthlyRate / 30) * remainingDays;
        totalInterest += remainingDaysInterest;
        newSteps.push(`⏰ Interest for remaining ${remainingDays} days: ₹${remainingDaysInterest.toFixed(2)}`);
      }

      const finalAmountValue = effectivePrincipal + totalInterest + noticeSafe;
      calculatedInterest = totalInterest;

      if (noticeSafe > 0) {
        newSteps.push(`📋 Notice Charge: ₹${noticeSafe.toLocaleString()}`);
      }
      newSteps.push(`🎯 Total Interest: ₹${calculatedInterest.toLocaleString()}`);
      newSteps.push(`💎 Final Amount: ₹${finalAmountValue.toLocaleString()}`);

      setInterest(calculatedInterest.toFixed(2));
      setFinalAmount(finalAmountValue.toFixed(2));
    }

    setSteps(newSteps);
    setIsCalculating(false);
  }, [principal, rate, customRate, startDate, endDate, interestType, noticeCharge]);

  useEffect(() => {
    const t = setTimeout(() => {
      calculateInterest();
    }, 300);
    return () => clearTimeout(t);
  }, [calculateInterest]);

  const generatePDF = async () => {
    if (!finalAmount || !interest) {
      alert('Please complete the calculation before generating a PDF.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFillColor(255, 193, 7);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Balaji Jewellery BJR - Interest Calculator', 20, 20);

      // Info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')} | Balaji Jewellery BJR`, 20, 40);

      // Summary box
      doc.setDrawColor(255, 193, 7);
      doc.setLineWidth(1);
      doc.rect(15, 50, 180, 80);
      doc.setFillColor(255, 248, 220);
      doc.rect(15, 50, 180, 80, 'F');

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('CALCULATION SUMMARY', 20, 60);

      const s = parseDate(startDate)!;
      const e = parseDate(endDate)!;

      doc.setFontSize(11);
      doc.text(`Principal Amount: Rs.${parseFloat(principal).toLocaleString()}`, 20, 75);
      doc.text(`Interest Rate: ${rate === 'custom' ? customRate : rate}% per month`, 20, 85);
      doc.text(`Interest Type: ${interestType === 'simple' ? 'Simple Interest' : 'Compound Interest'}`, 20, 95);
      doc.text(`Time Period: ${timePeriod}`, 20, 105);
      doc.text(`Start Date: ${format(s, 'dd MMM yyyy')}`, 20, 115);
      doc.text(`End Date: ${format(e, 'dd MMM yyyy')}`, 20, 125);

      // Results
      doc.setFillColor(34, 197, 94);
      doc.rect(15, 140, 180, 40, 'F');

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('RESULTS', 20, 155);

      doc.setFontSize(12);
      doc.text(`Total Interest: Rs.${parseFloat(interest).toLocaleString()}`, 20, 170);
      doc.text(`Final Amount: Rs.${parseFloat(finalAmount).toLocaleString()}`, 100, 170);

      // Steps
      if (steps.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('DETAILED CALCULATION STEPS', 20, 195);

        doc.setFontSize(10);
        let y = 205;
        steps.forEach((step, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const clean = step.replace(/[^\w\s₹.,:()\-]/g, '').trim();
          doc.text(`${idx + 1}. ${clean}`, 20, y);
          y += 8;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} | Balaji Jewellery BJR`, 20, (doc.internal as any).pageSize.height - 10);
      }

      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.pdf`, { type: 'application/pdf' });

      if ((navigator as any).share && (navigator as any).canShare && (navigator as any).canShare({ files: [pdfFile] })) {
        try {
          await (navigator as any).share({
            title: 'Interest Calculation - Balaji Jewellery BJR',
            text: 'Interest calculation from Balaji Jewellery BJR',
            files: [pdfFile]
          });
        } catch (err: any) {
          if (!err || err.name !== 'AbortError') {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            link.click();
            URL.revokeObjectURL(pdfUrl);
          }
        }
      } else {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        link.click();
        URL.revokeObjectURL(pdfUrl);
      }

      setShowShareModal(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateImage = async () => {
    if (!finalAmount || !interest) {
      alert('Please complete the calculation before generating an image.');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const html2canvas = (await import('html2canvas')).default;

      const s = parseDate(startDate)!;
      const e = parseDate(endDate)!;

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
          <h2 style="color: #6b7280; margin: 5px 0 0 0; font-size: 18px;">Interest Calculator</h2>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: bold;">CALCULATION SUMMARY</h3>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #374151;"><strong>Principal Amount:</strong> Rs.${parseFloat(principal).toLocaleString()}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Interest Rate:</strong> ${rate === 'custom' ? customRate : rate}% per month</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Interest Type:</strong> ${interestType === 'simple' ? 'Simple Interest' : 'Compound Interest'}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Time Period:</strong> ${timePeriod}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Duration:</strong> ${format(s, 'dd MMM yyyy')} to ${format(e, 'dd MMM yyyy')}</p>
          </div>

          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #166534; font-size: 18px;"><strong>Total Interest: Rs.${parseFloat(interest || '0').toLocaleString()}</strong></p>
            <p style="margin: 5px 0; color: #166534; font-size: 20px;"><strong>Final Amount: Rs.${parseFloat(finalAmount || '0').toLocaleString()}</strong></p>
          </div>
        </div>

        ${steps.length > 0 ? `
          <div>
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: bold;">CALCULATION STEPS</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 12px;">
              ${steps.map((step, index) => {
                const cleanStep = step.replace(/[^\w\\s₹.,:()\\-]/g, '').replace(/₹/g, 'Rs.').trim();
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

      canvas.toBlob(async (blob) => {
        if (blob) {
          const imageFile = new File([blob], `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.png`, { type: 'image/png' });

          if ((navigator as any).share && (navigator as any).canShare && (navigator as any).canShare({ files: [imageFile] })) {
            try {
              await (navigator as any).share({
                title: 'Interest Calculation - Balaji Jewellery BJR',
                text: 'Interest calculation from Balaji Jewellery BJR',
                files: [imageFile]
              });
            } catch (err: any) {
              if (!err || err.name !== 'AbortError') {
                const link = document.createElement('a');
                link.download = `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.png`;
                link.href = canvas.toDataURL();
                link.click();
              }
            }
          } else {
            const link = document.createElement('a');
            link.download = `Balaji_Jewellery_Interest_${format(new Date(), 'yyyy-MM-dd')}.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        }
      }, 'image/png');

      setShowShareModal(true);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getShareText = () => {
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    const startTxt = s ? format(s, 'dd MMM yyyy') : startDate;
    const endTxt = e ? format(e, 'dd MMM yyyy') : endDate;

    const baseText =
      `💎 *Balaji Jewellery BJR - Interest Calculation*\n\n` +
      `📊 *Principal:* Rs.${parseFloat(principal || '0').toLocaleString()}\n` +
      `📈 *Interest Rate:* ${rate === 'custom' ? customRate : rate}% per month\n` +
      `⚙️ *Interest Type:* ${interestType === 'simple' ? 'Simple' : 'Compound'}\n` +
      `⏰ *Time Period:* ${timePeriod}\n` +
      `📅 *Duration:* ${startTxt} to ${endTxt}\n\n` +
      `💰 *Total Interest:* Rs.${parseFloat(interest || '0').toLocaleString()}\n` +
      `💎 *Final Amount:* Rs.${parseFloat(finalAmount || '0').toLocaleString()}`;

    if (steps.length > 0) {
      const cleanSteps = steps.map((step, index) => {
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
    const subject = 'Interest Calculation - Balaji Jewellery BJR';
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
    setPrincipal('');
    setRate('2');
    setCustomRate('');
    setNoticeCharge('');
    setStartDate('');
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setInterest(null);
    setFinalAmount(null);
    setTimePeriod('');
    setSteps([]);
    setError(null);
  };

  // Helpers for date input that supports typing + native picker
  const DateInput: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
  }> = ({ label, value, onChange, hint }) => {
    return (
      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {label}
          {hint && (
            <div className="ml-1 group relative">
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {hint}
              </div>
            </div>
          )}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => (e.currentTarget.type = 'date')}
          onBlur={(e) => {
            if (!e.currentTarget.value) e.currentTarget.type = 'text';
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
          placeholder="dd-mm-yyyy or dd/mm/yyyy"
        />
        <p className="text-xs text-gray-500 mt-1">Format: dd-mm-yyyy or dd/mm/yyyy</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center items-center mb-4">
            <Calculator className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 text-amber-600 mr-2 sm:mr-3" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Balaji Jewellery BJR</h1>
              <p className="text-lg sm:text-xl text-amber-600 font-semibold">Interest Calculator</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Professional Interest Calculation Tool</p>
          <div className="flex justify-center items-center mt-2 space-x-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 mr-1" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center">
              <Tablet className="w-4 h-4 mr-1" />
              <span>Tablet</span>
            </div>
            <div className="flex items-center">
              <Monitor className="w-4 h-4 mr-1" />
              <span>Desktop</span>
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
              {/* Principal Amount */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal Amount (₹) *
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter principal amount"
                />
              </div>

              {/* Interest Rate */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Interest Rate (% per month) *
                </label>
                <select
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                >
                  <option value="2">2%</option>
                  <option value="3">3%</option>
                  <option value="4">4%</option>
                  <option value="1.5">1.5%</option>
                  <option value="2.5">2.5%</option>
                  <option value="3.5">3.5%</option>
                  <option value="custom">Custom</option>
                </select>
                {rate === 'custom' && (
                  <input
                    type="number"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="w-full mt-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter custom rate"
                  />
                )}
              </div>

              {/* Notice Charge */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Charge (₹)
                </label>
                <input
                  type="number"
                  value={noticeCharge}
                  onChange={(e) => setNoticeCharge(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter notice charge (optional)"
                />
              </div>

              {/* Date Range (manual typing + picker on focus) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateInput
                  label="Start Date *"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DateInput
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  hint="Defaults to today"
                />
              </div>

              {/* Interest Type */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Interest Type *
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="simple"
                      checked={interestType === 'simple'}
                      onChange={(e) => setInterestType(e.target.value as 'simple')}
                      className="mr-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm sm:text-base">Simple Interest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="compound"
                      checked={interestType === 'compound'}
                      onChange={(e) => setInterestType(e.target.value as 'compound')}
                      className="mr-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm sm:text-base">Compound Interest</span>
                  </label>
                </div>
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

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isCalculating ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : interest && finalAmount ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                <div id="calculation-summary" className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium text-sm sm:text-base">Total Interest</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-800">₹{parseFloat(interest).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium text-sm sm:text-base">Final Amount</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-800">₹{parseFloat(finalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium text-sm sm:text-base">Time Period</span>
                      <span className="text-sm sm:text-lg font-semibold text-purple-800">{timePeriod}</span>
                    </div>
                  </div>
                </div>

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
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                {steps.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Calculation Steps
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-60 overflow-y-auto">
                      <ol className="space-y-1 sm:space-y-2">
                        {steps.map((step, index) => (
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
                <Calculator className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" />
                <p className="text-center text-sm sm:text-base">Enter principal amount and start date to begin calculation</p>
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
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Choose how you'd like to share your calculation:
              </p>
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

export default InterestCalculator;
