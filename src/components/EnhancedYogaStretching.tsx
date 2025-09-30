import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LanguageSelector } from './LanguageSelector';
import { translations, Language } from '@/lib/translations';
import { playTextToSpeech } from '@/lib/audio';

interface EnhancedYogaStretchingProps {
  onBack: () => void;
}

// Enhanced yoga poses with detailed instructions and visual cues
const yogaPoses = {
  morning: {
    name: { en: "Morning Flow", hi: "प्रातःकाल योग", ta: "காலை யோகா", te: "ఉదయ యోగా", kn: "ಬೆಳಗಿನ ಯೋಗ", bn: "সকালের যোগ" },
    description: { en: "Energizing poses to start your day", hi: "दिन की शुरुआत के लिए ऊर्जावान आसन", ta: "உங்கள் நாளைத் தொடங்க ஊக்கமளிக்கும் आसन", te: "మీ రోజును ప్రారంభించడానికి శక్తివంతమైన आसాలు", kn: "ನಿಮ್ಮ ದಿನವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಶಕ್ತಿದಾಯಕ आसन", bn: "আপনার দিন শুরু করার জন্য শক্তিদায়ক আসন" },
    poses: [
      {
        name: { en: "Mountain Pose", hi: "पर्वतासन", ta: "மலை आसನம்", te: "పర్వత आसనం", kn: "ಪರ್ವತ आसন", bn: "পর্বত আসন" },
        duration: 30000,
        instructions: {
          en: "Stand tall with feet hip-width apart. Ground through your feet, lengthen your spine, and breathe deeply. Feel yourself rooted like a mountain.",
          hi: "पैरों को कूल्हे की चौड़ाई के बराबर करके सीधे खड़े हों। पैरों के माध्यम से जमीन से जुड़ें, रीढ़ को लंबा करें और गहरी सांस लें।",
          ta: "கால்களை இடுப்பு அகலத्या वைत्து நெটागা நിल्लुங्गळ्। कालगळिळ मूलमागा భूमियोडु जोडिकोনि, వెన్నెముకను పొడవుగా చేసి లోతైన శ్వాস తీసుకోండి।",
          te: "కాళ్లను తుంటి వెడల్పుకు సమానంగా ఉంచి నిటారుగా నిలబండి। కాళ్ల ద్వారా భూమితో అనుసంధానం కలిగి, వెన్నెముకను పొడిగించి లోతైన శ్వాస తీసుకోండి।",
          kn: "ಕಾಲುಗಳನ್ನು ಸೊಂಟದ ಅಗಲಕ್ಕೆ ಸಮಾನವಾಗಿ ಇಟ್ಟು ನೇರವಾಗಿ ನಿಲ್ಲಿ। ಕಾಲುಗಳ ಮೂಲಕ ನೆಲದೊಂದಿಗೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಿ, ಬೆನ್ನುಮೂಳೆಯನ್ನು ಉದ್ದಗೊಳಿಸಿ ಮತ್ತು ಆಳವಾದ ಉಸಿರಾಟ ಮಾಡಿ।",
          bn: "পা দুটিকে কোমরের প্রস্থের সমান করে সোজা হয়ে দাঁড়ান। পায়ের মাধ্যমে মাটির সাথে সংযুক্ত হন, মেরুদণ্ড লম্বা করুন এবং গভীর শ্বাস নিন।"
        },
        image: "🏔️"
      },
      {
        name: { en: "Sun Salutation A", hi: "सूर्य नमस्कार अ", ta: "சூரிய நमस्कார अ", te: "సూర్య నమస్కార అ", kn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ ಅ", bn: "সূর্য নমস্কার এ" },
        duration: 60000,
        instructions: {
          en: "Begin in Mountain Pose. Inhale, sweep arms up. Exhale, fold forward. Inhale, half lift. Exhale, step back to plank. Lower down, then cobra pose. Exhale, downward dog. Step forward and return to standing.",
          hi: "पर्वतासन से शुरू करें। सांस लेते हुए बाहों को ऊपर ले जाएं। सांस छोड़ते हुए आगे की ओर झुकें। सांस लेते हुए आधा उठें। सांस छोड़ते हुए तख्तासन में जाएं।",
          ta: "மலை आसनத्तिलिरुन्दु आरम्भिक्कवुम्। श्वासम् इऴुत्तु कैगळै мेले एत्तवुम्। श्वासम् विडु मुन्नाळे कुनिवुम्। श्वासम् इऴुत्तु अरै एळुम्बवुम्।",
          te: "పర్వత ఆసనంలో మొదలుపెట్టండి। ఊపిరి పీల్చుతూ చేతులను పైకి ఎత్తండి। ఊపిరి వదులుతూ ముందుకు వంగండి। ఊపిరి పీల్చుతూ సగం పైకి లేవండి।",
          kn: "ಪರ್ವತ ಆಸನದಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ। ಉಸಿರು ಸೇದುತ್ತಾ ಕೈಗಳನ್ನು ಮೇಲೆ ಎತ್ತಿ। ಉಸಿರು ಬಿಡುತ್ತಾ ಮುಂದಕ್ಕೆ ಬಾಗಿ। ಉಸಿರು ಸೇದುತ್ತಾ ಅರ್ಧ ಎತ್ತಿ।",
          bn: "পর্বত আসনে শুরু করুন। শ্বাস নিতে নিতে হাত উপরে তুলুন। শ্বাস ছাড়তে ছাড়তে সামনে ঝুঁকুন। শ্বাস নিতে নিতে অর্ধেক উঠুন।"
        },
        image: "☀️"
      },
      {
        name: { en: "Warrior I", hi: "वीरभद्रासन I", ta: "வீர भद्रासনम् I", te: "వీరభద్రాసనం I", kn: "ವೀರಭದ್ರಾಸನ I", bn: "বীরভদ্রাসন I" },
        duration: 45000,
        instructions: {
          en: "Step your left foot back 3-4 feet. Turn your left foot out 45 degrees. Bend your right knee over ankle. Sweep arms up overhead. Hold and breathe. Repeat on other side.",
          hi: "बाएं पैर को 3-4 फीट पीछे रखें। बाएं पैर को 45 डिग्री बाहर की ओर घुमाएं। दाएं घुटने को टखने के ऊपर मोड़ें। बाहों को ऊपर ले जाएं।",
          ta: "इडदु कालै 3-4 अडि पिनाळे वैयुङ्गळ्। इडदु कालै 45 डिग्री वेळिये तिरुपुङ्गळ्। वळदु मुळुगाट्टै कालुमुट्टिमेले मडक्कुङ्गळ्।",
          te: "ఎడమ పాదాన్ని 3-4 అడుగుల వెనుకకు వేయండి। ఎడమ పాదాన్ని 45 డిగ్రీలు బయటకు తిప్పండి। కుడి మోకాలిని చీలమండ మీద వంచండి।",
          kn: "ಎಡ ಕಾಲನ್ನು 3-4 ಅಡಿ ಹಿಂದಕ್ಕೆ ಇರಿಸಿ। ಎಡ ಕಾಲನ್ನು 45 ಡಿಗ್ರಿ ಹೊರಕ್ಕೆ ತಿರುಗಿಸಿ। ಬಲ ಮೊಣಕಾಲನ್ನು ಕಣುಗೋಳಿನ ಮೇಲೆ ಬಾಗಿಸಿ।",
          bn: "বাম পা 3-4 ফুট পিছনে রাখুন। বাম পা 45 ডিগ্রি বাইরের দিকে ঘুরান। ডান হাঁটু গোড়ালির উপর বাঁকান।"
        },
        image: "⚔️"
      },
      {
        name: { en: "Triangle Pose", hi: "त्रिकोणासन", ta: "திरिकोणासनम्", te: "త్రికోణాసనం", kn: "ತ್ರಿಕೋಣಾಸನ", bn: "ত্রিকোণাসন" },
        duration: 45000,
        instructions: {
          en: "Stand with feet 3.5-4 feet apart. Turn right foot out 90 degrees. Extend arms parallel to floor. Reach forward with right hand, then down to shin or block. Left arm reaches up. Breathe deeply.",
          hi: "पैरों को 3.5-4 फीट की दूरी पर रखें। दाएं पैर को 90 डिग्री बाहर घुमाएं। बाहों को फर्श के समानांतर फैलाएं। दाएं हाथ से आगे पहुंचें, फिर पिंडली तक नीचे।",
          ta: "कालगळै 3.5-4 अडि दूरत्तिल् वैयुङ्गळ्। वळदु कालै 90 डिग्री वेळिये तिरुपुङ्गळ्। कैगळै भूमिक्कु समानम्गा विरिक्कुङ्गळ्।",
          te: "కాళ్లను 3.5-4 అడుగుల దూరంలో ఉంచండి। కుడి పాదాన్ని 90 డిగ్రీలు బయటకు తిప్పండి। చేతులను నేలకు సమాంతరంగా విస్తరించండి।",
          kn: "ಕಾಲುಗಳನ್ನು 3.5-4 ಅಡಿ ದೂರದಲ್ಲಿ ಇರಿಸಿ। ಬಲ ಕಾಲನ್ನು 90 ಡಿಗ್ರಿ ಹೊರಕ್ಕೆ ತಿರುಗಿಸಿ। ಕೈಗಳನ್ನು ನೆಲಕ್ಕೆ ಸಮಾಂತರವಾಗಿ ವಿಸ್ತರಿಸಿ।",
          bn: "পা দুটিকে 3.5-4 ফুট দূরত্বে রাখুন। ডান পা 90 ডিগ্রি বাইরের দিকে ঘুরান। হাত দুটি মেঝের সমান্তরালে বিস্তার করুন।"
        },
        image: "🔺"
      },
      {
        name: { en: "Tree Pose", hi: "वृक्षासन", ta: "விருक्षासनम्", te: "వృక్షాసనం", kn: "ವೃಕ್ಷಾಸನ", bn: "বৃক্ষাসন" },
        duration: 30000,
        instructions: {
          en: "Stand on left leg. Place right foot on inner left thigh or calf (not on knee). Press foot into leg and leg into foot. Hands in prayer or overhead. Find your balance like a tree. Repeat other side.",
          hi: "बाएं पैर पर खड़े हों। दाएं पैर को बाएं जांघ के भीतरी हिस्से या पिंडली पर रखें। पैर को पैर में दबाएं। हाथों को प्रार्थना की मुद्रा में या ऊपर रखें।",
          ta: "इडदु कालिल् निल्लुङ्गळ्। वळदु कालै इडदु तोडैयिन् अगप्पुरत्तिल् अल्लदु कण्डैकालिल् वैयुङ्गळ्। कैगळै प्रार्थनैयिल् अल्लदु मेले।",
          te: "ఎడమ కాలిపై నిలబండి। కుడి పాదాన్ని ఎడమ తొడ లోపలి భాగంలో లేదా దూడపై ఉంచండి। చేతులను ప్రార్థనలో లేదా పైకి ఎత్తండి।",
          kn: "ಎಡ ಕಾಲಿನ ಮೇಲೆ ನಿಲ್ಲಿ। ಬಲ ಪಾದವನ್ನು ಎಡ ತೊಡೆಯ ಒಳಭಾಗದಲ್ಲಿ ಅಥವಾ ಕರುಗಾಲಿನ ಮೇಲೆ ಇರಿಸಿ। ಕೈಗಳನ್ನು ಪ್ರಾರ್ಥನೆಯಲ್ಲಿ ಅಥವಾ ಮೇಲೆ।",
          bn: "বাম পায়ে দাঁড়ান। ডান পা বাম উরুর ভিতরের অংশে বা পিন্ডলিতে রাখুন। হাত দুটি প্রার্থনায় বা উপরে তুলুন।"
        },
        image: "🌳"
      }
    ]
  },
  stress: {
    name: { en: "Stress Relief", hi: "तनाव मुक्ति", ta: "மानसिक அழুत्तम् நीक्कम्", te: "ఒత్తిడి ఉపశమనం", kn: "ಒತ್ತಡ ಪರಿಹಾರ", bn: "মানসিক চাপ মুক্তি" },
    description: { en: "Calming poses to release tension", hi: "तनाव मुक्त करने के लिए शांत आसन", ta: "तनावै विडुवदर्कु शान्तमान आसनगळ्", te: "ఒత్తిడిని తొలగించడానికి ప్రశాంత ఆసనాలు", kn: "ಒತ್ತಡವನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲು ಶಾಂತ ಆಸನಗಳು", bn: "চাপ মুক্ত করার জন্য শান্ত আসন" },
    poses: [
      {
        name: { en: "Child's Pose", hi: "बालासन", ta: "बालासनम्", te: "బాలాసనం", kn: "ಬಾಲಾಸನ", bn: "বালাসন" },
        duration: 60000,
        instructions: {
          en: "Kneel on the floor. Touch your big toes together and sit back on your heels. Separate your knees hip-width apart. Fold forward, extending arms in front. Rest forehead on mat. Breathe deeply and relax.",
          hi: "फर्श पर घुटने टेकें। अपने बड़े पैर की उंगलियों को एक साथ छुएं और एड़ियों पर बैठें। घुटनों को कूल्हे की चौड़ाई के बराबर अलग करें।",
          ta: "भूमियिल् मुळुगाळित्तु कुळुन्दुकोळ्ळुङ्गळ्। पेरिय विरलगळै ओन्राग स्पर्शिक्कुङ्गळ्। मुळुगाळगळै कुत्तिक्कु समान अगलत्तिल् वैयुङ्गळ्।",
          te: "నేలపై మోకాళ్లపై కూర్చోండి. మీ బొటన వేళ్లను తాకండi మరియు మడిమెలపై కూర్చోండi. మోకాళ్లను తుంటి వెడల్పుకు వేరు చెయ్యండi.",
          kn: "ನೆಲದ ಮೇಲೆ ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಕುಳಿತುಕೊಳ್ಳಿ। ನಿಮ್ಮ ಹೆಬ್ಬೆರಳುಗಳನ್ನು ಒಟ್ಟಿಗೆ ಸ್ಪರ್ಶಿಸಿ ಮತ್ತು ಹಿಮ್ಮಡಿಗಳ ಮೇಲೆ ಕುಳಿತುಕೊಳ್ಳಿ।",
          bn: "মেঝেতে হাঁটু গেড়ে বসুন। আপনার বুড়ো আঙুল একসাথে স্পর্শ করুন এবং গোড়ালিতে বসুন। হাঁটু দুটি কোমরের প্রস্থের সমান আলাদা করুন।"
        },
        image: "🧘‍♀️"
      },
      {
        name: { en: "Cat-Cow Pose", hi: "मार्जरी-बिटिलासन", ta: "मार्जार-गो आसनम्", te: "మార్జరీ-గో ఆసనం", kn: "ಮಾರ್ಜಾರಿ-ಗೋ ಆಸನ", bn: "মার্জারী-গো আসন" },
        duration: 45000,
        instructions: {
          en: "Start on hands and knees. Arch your back, lift chest and tailbone (Cow). Then round your spine, tuck chin to chest (Cat). Move slowly with your breath. Repeat 5-8 times.",
          hi: "हाथों और घुटनों पर शुरू करें। अपनी पीठ को धनुषाकार बनाएं, छाती और टेलबोन को उठाएं। फिर रीढ़ को गोल करें, ठुड्डी को छाती से लगाएं।",
          ta: "कैयुम् मुळुगाळुम् मेले आरम्भिप्पुङ्गळ्। मुगैये मेळक्कि, नेञ्जुम् वालुम् एत्तुङ्गळ्। पिन्बु मुगै कुनिञ्जु, कळुत्तै नेञ्जोडु सेर्क्कुङ्गळ्।",
          te: "చేతులు మరియు మోకాళ్లపై ప్రారంభించండి। మీ వీపును వంచండి, ఛాతీ మరియు తోక ఎత్తండి. అప్పుడు వెన్నెముకను గుండ్రంగా చేసి, గడ్డాన్ని ఛాతీకి తాకండి।",
          kn: "ಕೈಗಳು ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಪ್ರಾರಂಭಿಸಿ। ನಿಮ್ಮ ಬೆನ್ನನ್ನು ಬಾಗಿಸಿ, ಎದೆ ಮತ್ತು ಬಾಲವನ್ನು ಎತ್ತಿ। ನಂತರ ಬೆನ್ನುಮೂಳೆಯನ್ನು ಸುತ್ತಾಗಿ ಮಾಡಿ।",
          bn: "হাত ও হাঁটুর উপর শুরু করুন। আপনার পিঠ বাঁকিয়ে, বুক ও লেজ তুলুন। তারপর মেরুদণ্ড গোল করে, চিবুক বুকে লাগান।"
        },
        image: "🐱"
      },
      {
        name: { en: "Seated Forward Fold", hi: "पश्चिमोत्तानासन", ta: "पश्चिमोत्तानासनम्", te: "పశ్చిమోత్తానాసనం", kn: "ಪಶ್ಚಿಮೋತ್ತಾನಾಸನ", bn: "পশ্চিমোত্তানাসন" },
        duration: 60000,
        instructions: {
          en: "Sit with legs extended straight. Inhale, lengthen spine. Exhale, hinge forward from hips. Reach for feet, shins, or knees. Keep spine long. Breathe deeply and surrender to the pose.",
          hi: "पैरों को सीधा फैलाकर बैठें। सांस लेते हुए रीढ़ को लंबा करें। सांस छोड़ते हुए कूल्हों से आगे झुकें। पैरों, पिंडलियों या घुटनों तक पहुंचें।",
          ta: "कालगळै नेराग विरित्तु उक्कारुङ्गळ्। श्वासम् इऴुत्तु मुगै नीळम् पण्णुङ्गळ्। श्वासम् विडु कुत्तिलिरुन्दु मुन्नाळे कुनिवुङ्गळ्।",
          te: "కాళ్లను నేరుగా విస్తరించి కూర్చోండి। ఊపిరి పీల్చుతూ వెన్నెముకను పొడిగించండి. ఊపిరి వదులుతూ తుంటి నుండి ముందుకు వంగండి।",
          kn: "ಕಾಲುಗಳನ್ನು ನೇರವಾಗಿ ವಿಸ್ತರಿಸಿ ಕುಳಿತುಕೊಳ್ಳಿ। ಉಸಿರು ಸೇದುತ್ತಾ ಬೆನ್ನುಮೂಳೆಯನ್ನು ಉದ್ದಗೊಳಿಸಿ। ಉಸಿರು ಬಿಡುತ್ತಾ ತೊಡೆಯಿಂದ ಮುಂದಕ್ಕೆ ಬಾಗಿ।",
          bn: "পা দুটি সোজা করে বসুন। শ্বাস নিতে নিতে মেরুদণ্ড লম্বা করুন। শ্বাস ছাড়তে ছাড়তে কোমর থেকে সামনে ঝুঁকুন।"
        },
        image: "🤸‍♀️"
      },
      {
        name: { en: "Legs Up Wall", hi: "विपरीत करणी", ta: "विपरीत करणी", te: "విపరీత కరణీ", kn: "ವಿಪರೀತ ಕರಣೀ", bn: "বিপরীত করণী" },
        duration: 120000,
        instructions: {
          en: "Lie on your back near a wall. Scoot your sitting bones close to wall. Extend legs up the wall. Arms relaxed by sides. Close eyes, breathe deeply. This pose calms the nervous system.",
          hi: "दीवार के पास पीठ के बल लेटें। अपनी कूल्हे की हड्डियों को दीवार के पास ले जाएं। पैरों को दीवार पर फैलाएं। बाहों को बगल में आराम से रखें।",
          ta: "सुवरिन् अडुत्तु मल्लाक्कि पडुत्तुकोळ्ळुङ्गळ्। उङ्गळुडैय उक्कार एळुम्बुगळै सुवरिन् अडुत्तु कोन्डुवारुङ्गळ्। कालगळै सुवरिल् एत्तुङ्गळ्।",
          te: "గోడకు దగ్గరగా మీ వెనుకవైపు పడుకోండి. మీ కూర్చునే ఎముకలను గోడకు దగ్గరగా తీసుకోండి. కాళ్లను గోడపై విస్తరించండి।",
          kn: "ಗೋಡೆಯ ಬಳಿ ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ. ನಿಮ್ಮ ಕುಳಿತುಕೊಳ್ಳುವ ಎಲುಬುಗಳನ್ನು ಗೋಡೆಯ ಹತ್ತಿರ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ। ಕಾಲುಗಳನ್ನು ಗೋಡೆಯ ಮೇಲೆ ವಿಸ್ತರಿಸಿ।",
          bn: "দেয়ালের কাছে আপনার পিঠের উপর শুয়ে পড়ুন। আপনার বসার হাড়গুলি দেয়ালের কাছে নিয়ে যান। পা দুটি দেয়ালে বিস্তার করুন।"
        },
        image: "🔄"
      }
    ]
  },
  bedtime: {
    name: { en: "Bedtime Relaxation", hi: "सोने का समय", ta: "நिद्रै समयम्", te: "నిద్రా సమయం", kn: "ನಿದ್ರೆಯ ಸಮಯ", bn: "শোবার সময়" },
    description: { en: "Gentle poses for better sleep", hi: "बेहतर नींद के लिए कोमल आसन", ta: "नल्ल तूक्कत्तिर्कु मृदुवान आसनगळ्", te: "మంచి నిద్రకు సున్నితమైన ఆసనాలు", kn: "ಉತ್ತಮ ನಿದ್ರೆಗಾಗಿ ಮೃದುವಾದ ಆಸನಗಳು", bn: "ভাল ঘুমের জন্য কোমল আসন" },
    poses: [
      {
        name: { en: "Supine Spinal Twist", hi: "शवासन रीढ़ का मोड़", ta: "सुप्त मेरुदण्ड भ्रमणम्", te: "సుప్త వెన్నెముక భ్రమణం", kn: "ಸುಪ್ತ ಬೆನ್ನುಮೂಳೆ ತಿರುವು", bn: "শায়িত মেরুদণ্ড মোচড়" },
        duration: 60000,
        instructions: {
          en: "Lie on your back. Draw right knee to chest, then cross it over to left side. Extend right arm out. Turn head right. Breathe deeply. Feel the gentle twist releasing tension. Switch sides.",
          hi: "पीठ के बल लेटें। दाएं घुटने को छाती की ओर खींचें, फिर इसे बाईं ओर ले जाएं। दाएं बाहू को फैलाएं। सिर को दाईं ओर घुमाएं।",
          ta: "मल्लाक्कि पडुत्तुकोळ्ळुङ्गळ्। वळदु मुळुङ्गाळै नेञ्जिर्कु इऴुत्तु, पिन्बु अदै इडदु पक्कत्तिर्कु कोन्डुपोवुङ्गळ्। वळदु कैयै विरिक्कुङ्गळ्।",
          te: "మీ వెనుకవైపు పడుకోండి. కుడి మోకాలిని ఛాతీకి లాగండి, తర్వాత దానిని ఎడమ వైపుకు దాటండి. కుడి చేతిని విస్తరించండి।",
          kn: "ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ. ಬಲ ಮೊಣಕಾಲನ್ನು ಎದೆಗೆ ಎಳೆಯಿರಿ, ನಂತರ ಅದನ್ನು ಎಡ ಬದಿಗೆ ದಾಟಿಸಿ। ಬಲ ಕೈಯನ್ನು ವಿಸ್ತರಿಸಿ।",
          bn: "আপনার পিঠের উপর শুয়ে পড়ুন। ডান হাঁটু বুকের দিকে টানুন, তারপর এটি বাম দিকে নিয়ে যান। ডান হাত বিস্তার করুন।"
        },
        image: "🌙"
      },
      {
        name: { en: "Happy Baby", hi: "आनंदमय बच्चा", ta: "आनन्दमयमान कुळन्दै", te: "ఆనందమయ శిశువు", kn: "ಆನಂದಮಯ ಮಗು", bn: "আনন্দময় শিশু" },
        duration: 45000,
        instructions: {
          en: "Lie on back, draw knees to chest. Grab outside edges of feet with hands. Gently pull knees toward armpits. Rock side to side if it feels good. Breathe and smile like a happy baby.",
          hi: "पीठ के बल लेटें, घुटनों को छाती की ओर खींचें। हाथों से पैरों के बाहरी किनारों को पकड़ें। घुटनों को धीरे से बगलों की ओर खींचें।",
          ta: "मल्लाक्कि पडुत्तु, मुळुङ्गाळगळै नेञ्जिर्कु इऴुत्तुकोळ्ळुङ्गळ्। कैगळाल् कालगळिन् वेळिप्पुर कोरुगळै पिडिक्कुङ्गळ्।",
          te: "వెనుకవైపు పడుకోని, మోకాళ్లను ఛాతీకి లాగండి. చేతులతో పాదాల బయటి అంచులను పట్టుకోండి। మోకాళ్లను మెత్తగా చంకల వైపు లాగండి।",
          kn: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ಮೊಣಕಾಲುಗಳನ್ನು ಎದೆಗೆ ಎಳೆಯಿರಿ। ಕೈಗಳಿಂದ ಪಾದಗಳ ಹೊರ ಅಂಚುಗಳನ್ನು ಹಿಡಿಯಿರಿ। ಮೊಣಕಾಲುಗಳನ್ನು ಮೆಲ್ಲಗೆ ಅಕ್ಕಪಕ್ಕಕ್ಕೆ ಎಳೆಯಿರಿ।",
          bn: "পিঠের উপর শুয়ে, হাঁটু বুকের দিকে টানুন। হাত দিয়ে পায়ের বাইরের প্রান্ত ধরুন। হাঁটু দুটি আস্তে করে বগলের দিকে টানুন।"
        },
        image: "👶"
      },
      {
        name: { en: "Reclined Butterfly", hi: "शयन तितली", ta: "सुप्त तितळि", te: "శయనమైన సీతాకోకచిలుక", kn: "ಶಯನ ಚಿಟ್ಟೆ", bn: "শায়িত প্রজাপতি" },
        duration: 90000,
        instructions: {
          en: "Lie on back. Bring soles of feet together, knees falling to sides. Place hands on belly or by sides. Close eyes and breathe deeply. Feel your hips opening and tension melting away.",
          hi: "पीठ के बल लेटें। पैरों के तलवों को एक साथ लाएं, घुटनों को बगल में गिरने दें। हाथों को पेट पर या बगल में रखें। आंखें बंद करें और गहरी सांस लें।",
          ta: "मल्लाक्कि पडुत्तुकोळ्ळुङ्गळ्। कालगळिन् अडिक्कळै कूट्टुङ्गळ्, मुळुङ्गाळगळै पक्कगळिले विळुवडट्टुङ्गळ्। कैगळै वयिट्टिल् अल्लदु पक्कत्तिल् वैयुङ्गळ्।",
          te: "వెనుకవైపు పడుకోండి. పాదాల అరికాళ్లను కలిపండి, మోకాళ్లను వైపులకు పడనివ్వండి. చేతులను కడుపుపై లేదా వైపులలో ఉంచండి।",
          kn: "ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ. ಪಾದಗಳ ಅರಿಕಾಲುಗಳನ್ನು ಒಟ್ಟಿಗೆ ತನ್ನಿ, ಮೊಣಕಾಲುಗಳನ್ನು ಬದಿಗಳಿಗೆ ಬೀಳಲು ಬಿಡಿ। ಕೈಗಳನ್ನು ಹೊಟ್ಟೆಯ ಮೇಲೆ ಅಥವಾ ಬದಿಯಲ್ಲಿ ಇರಿಸಿ।",
          bn: "পিঠের উপর শুয়ে পড়ুন। পায়ের তালু একসাথে আনুন, হাঁটু দুটি পাশে পড়তে দিন। হাত পেটে বা পাশে রাখুন।"
        },
        image: "🦋"
      },
      {
        name: { en: "Corpse Pose", hi: "शवासन", ta: "शवासनम्", te: "శవాసనం", kn: "ಶವಾಸನ", bn: "শবাসন" },
        duration: 180000,
        instructions: {
          en: "Lie completely flat on back. Arms by sides, palms up. Legs extended, feet falling open. Close eyes. Start from toes, relax every part of your body. Let go completely. Breathe naturally.",
          hi: "पीठ के बल बिल्कुल सपाट लेटें। बाहों को बगल में, हथेलियों को ऊपर की ओर। पैरों को फैलाएं, पैरों को खुला छोड़ें। आंखें बंद करें।",
          ta: "मल्लाक्कि पूर्णमागा सपाट्टागा पडुत्तुकोळ्ळुङ्गळ्। कैगळै पक्कत्तिल्, उळ्ळम् मेलागा। कालगळै विरित्तु, कालगळ् तेरन्दिरक्कट्टुम्। कण्गळै मूडुङ्गळ्।",
          te: "వెనుకవైపు పూర్తిగా ప్లాట్‌గా పడుకోండి. చేతులను వైపులలో, అరచేతులు పైకి. కాళ్లను విస్తరించి, పాదాలు తెరిచి పడనివ్వండి।",
          kn: "ಬೆನ್ನಿನ ಮೇಲೆ ಸಂಪೂರ್ಣವಾಗಿ ನೇರವಾಗಿ ಮಲಗಿ। ಕೈಗಳನ್ನು ಬದಿಯಲ್ಲಿ, ಅಂಗೈಗಳು ಮೇಲಕ್ಕೆ. ಕಾಲುಗಳನ್ನು ವಿಸ್ತರಿಸಿ, ಪಾದಗಳು ತೆರೆದಿರಲಿ।",
          bn: "পিঠের উপর সম্পূর্ণ সমতলভাবে শুয়ে পড়ুন। হাত পাশে, হাতের তালু উপরে। পা বিস্তার করে, পা খোলা রেখে দিন।"
        },
        image: "💀"
      }
    ]
  }
};

export const EnhancedYogaStretching = ({ onBack }: EnhancedYogaStretchingProps) => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedSequence, setSelectedSequence] = useState<keyof typeof yogaPoses>('morning');
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[language];
  const currentSequence = yogaPoses[selectedSequence];
  const currentPose = currentSequence.poses[currentPoseIndex];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1000) {
            if (currentPoseIndex < currentSequence.poses.length - 1) {
              setCurrentPoseIndex(prev => prev + 1);
              return currentSequence.poses[currentPoseIndex + 1].duration;
            } else {
              setIsCompleted(true);
              setIsActive(false);
              return 0;
            }
          }
          return time - 1000;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, currentPoseIndex, currentSequence.poses]);

  // Play audio instructions when pose changes
  useEffect(() => {
    if (isActive && currentPose && soundEnabled) {
      const instruction = currentPose.instructions[language];
      playTextToSpeech(`${currentPose.name[language]}. ${instruction}`);
    }
  }, [currentPoseIndex, isActive, soundEnabled, language, currentPose]);

  const toggleSession = () => {
    if (!isActive && !isCompleted) {
      setTimeLeft(currentPose.duration);
      setIsActive(true);
    } else if (isActive) {
      setIsActive(false);
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentPoseIndex(0);
    setTimeLeft(0);
  };

  const skipToNext = () => {
    if (currentPoseIndex < currentSequence.poses.length - 1) {
      setCurrentPoseIndex(prev => prev + 1);
      setTimeLeft(currentSequence.poses[currentPoseIndex + 1].duration);
    }
  };

  const handleSequenceChange = (sequence: keyof typeof yogaPoses) => {
    if (!isActive) {
      setSelectedSequence(sequence);
      setCurrentPoseIndex(0);
      setTimeLeft(0);
      setIsCompleted(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentPoseIndex + (currentPose?.duration - timeLeft) / currentPose?.duration) / currentSequence.poses.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur">
      <CardHeader className="text-center border-b border-border/50">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-foreground/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
          <div className="flex gap-2">
            <LanguageSelector language={language} onLanguageChange={setLanguage} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-foreground/70"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {t.enhancedYoga || t.yoga}
        </CardTitle>
        <p className="text-foreground/70">{t.enhancedYogaDesc || t.yogaDesc}</p>
      </CardHeader>

      <CardContent className="p-6">
        {!isActive && !isCompleted && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">{t.choosePose || 'Choose a pose'}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(yogaPoses).map(([key, sequence]) => (
                  <Button
                    key={key}
                    variant={selectedSequence === key ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleSequenceChange(key as keyof typeof yogaPoses)}
                  >
                    <div className="text-2xl">{key === 'morning' ? '🌅' : key === 'stress' ? '😌' : '🌙'}</div>
                    <div className="text-center">
                      <div className="font-medium">{sequence.name[language]}</div>
                      <div className="text-sm text-foreground/70">{sequence.description[language]}</div>
                      <div className="text-xs text-foreground/50 mt-1">{sequence.poses.length} poses</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-medium mb-3">{currentSequence.name[language]} - Preview</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {currentSequence.poses.map((pose, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/30 text-center">
                    <div className="text-2xl mb-2">{pose.image}</div>
                    <div className="font-medium text-sm">{pose.name[language]}</div>
                    <div className="text-xs text-foreground/60">{formatTime(pose.duration)}</div>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={toggleSession} className="bg-primary hover:bg-primary/90">
                <Play className="w-5 h-5 mr-2" />
                {t.start}
              </Button>
            </div>
          </div>
        )}

        {isActive && currentPose && (
          <div className="text-center space-y-6">
            <div className="mb-4">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-foreground/60 mt-2">
                Pose {currentPoseIndex + 1} of {currentSequence.poses.length}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-6xl animate-pulse">{currentPose.image}</div>
              <h3 className="text-2xl font-bold">{currentPose.name[language]}</h3>
              <div className="text-4xl font-mono text-primary">{formatTime(timeLeft)}</div>
              <div className="bg-secondary/30 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-foreground/80 leading-relaxed">{currentPose.instructions[language]}</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={toggleSession}>
                <Pause className="w-4 h-4 mr-2" />
                {t.pause}
              </Button>
              {currentPoseIndex < currentSequence.poses.length - 1 && (
                <Button variant="outline" onClick={skipToNext}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  {t.nextPose || 'Next Pose'}
                </Button>
              )}
              <Button variant="outline" onClick={resetSession}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t.reset}
              </Button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-primary">{t.complete}</h3>
            <p className="text-foreground/70">{t.wellDone}</p>
            <p className="text-sm text-foreground/60">
              Completed {currentSequence.name[language]} sequence with {currentSequence.poses.length} poses
            </p>
            <Button size="lg" onClick={resetSession} className="bg-primary hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" />
              {t.start} New Session
            </Button>
          </div>
        )}

        {!isActive && !isCompleted && (
          <div className="mt-8 p-4 bg-secondary/20 rounded-lg">
            <h4 className="font-medium mb-2">{t.gettingStarted}</h4>
            <p className="text-sm text-foreground/70">{t.gettingStartedText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};