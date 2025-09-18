import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { playTextToSpeech, stopCurrentAudio } from "@/lib/audio";
import { LanguageSelector } from "./LanguageSelector";

interface YogaStretchingProps {
  onBack: () => void;
}

const yogaSequences = {
  morning: {
    name: { en: "Morning Flow", hi: "सुबह का प्रवाह", ta: "காலை ஓட்டம்", te: "ఉదయ ప్రవాహం", kn: "ಬೆಳಿಗ್ಗೆ ಹರಿವು", bn: "সকালের প্রবাহ" },
    description: { en: "Energizing sequence to start your day", hi: "अपना दिन शुरू करने के लिए ऊर्जावान अनुक्रम", ta: "உங்கள் நாளைத் தொடங்க ஆற்றல் தரும் வரிசை", te: "మీ రోజును ప్రారంభించడానికి శక్తిదాయక క్రమం", kn: "ನಿಮ್ಮ ದಿನವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಶಕ್ತಿಯುತ ಅನುಕ್ರಮ", bn: "আপনার দিন শুরু করার জন্য শক্তিদায়ক ক্রম" },
    poses: [
      {
        name: { en: "Mountain Pose", hi: "पर्वत आसन", ta: "மலை நிலை", te: "పర్వత భంగిమ", kn: "ಪರ್ವತ ಆಸನ", bn: "পর্বত ভঙ্গি" },
        duration: 30000,
        instruction: {
          en: "Stand tall with feet hip-width apart. Ground through your feet, lengthen your spine, and breathe deeply. Feel your connection to the earth.",
          hi: "पैरों को कूल्हे की चौड़ाई के बराबर करके सीधे खड़े हों। अपने पैरों के माध्यम से जमीन से जुड़ें, अपनी रीढ़ को लंबा करें और गहरी सांस लें।",
          ta: "கால்களை இடுப்பு அகலத்தில் வைத்து நிமிர்ந்து நிற்கவும். உங்கள் கால்கள் வழியாக தரையுடன் இணைந்து, முதுகுத்தண்டை நீட்டி, ஆழமாக மூச்சு விடுங்கள்.",
          te: "కాళ్లను తుంటి వెడల్పులో ఉంచి నిటారుగా నిలబడండి. మీ కాళ్లద్వారా భూమితో అనుసంధానం చేసుకుని, వెన్నెముకను పొడవుగా చేసి, లోతుగా శ్వసించండి.",
          kn: "ಕಾಲುಗಳನ್ನು ಸೊಂಟದ ಅಗಲದಲ್ಲಿ ಇಟ್ಟುಕೊಂಡು ನೇರವಾಗಿ ನಿಲ್ಲಿ. ನಿಮ್ಮ ಕಾಲುಗಳ ಮೂಲಕ ನೆಲದೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ಬೆನ್ನುಮೂಳೆಯನ್ನು ಉದ್ದಗೊಳಿಸಿ ಮತ್ತು ಆಳವಾಗಿ ಉಸಿರಾಡಿ.",
          bn: "পা দুটি নিতম্বের প্রস্থ অনুযায়ী রেখে সোজা হয়ে দাঁড়ান। আপনার পায়ের মাধ্যমে মাটির সাথে সংযোগ স্থাপন করুন, মেরুদণ্ড লম্বা করুন এবং গভীর শ্বাস নিন।"
        }
      },
      {
        name: { en: "Forward Fold", hi: "आगे की ओर झुकना", ta: "முன்னோக்கி மடிப்பு", te: "ముందుకు వంగడం", kn: "ಮುಂದೆ ಬಾಗುವುದು", bn: "সামনের দিকে ভাঁজ" },
        duration: 30000,
        instruction: {
          en: "Slowly hinge at your hips and fold forward. Let your arms hang heavy and sway gently. Feel the stretch in your hamstrings and lower back.",
          hi: "धीरे-धीरे अपने कूल्हों से मुड़ें और आगे की ओर झुकें। अपनी बाहों को भारी लटकने दें और धीरे से हिलाएं। अपनी हैमस्ट्रिंग और पीठ के निचले हिस्से में खिंचाव महसूस करें।",
          ta: "மெதுவாக உங்கள் இடுப்பில் வளைந்து முன்னோக்கி மடிக்கவும். உங்கள் கைகளை கனமாக தொங்க விட்டு மெதுவாக அசையுங்கள். உங்கள் தொடை தசைகள் மற்றும் கீழ் முதுகில் நீட்சியை உணருங்கள்.",
          te: "నెమ్మదిగా మీ తుంటిల వద్ద వంగి ముందుకు మడవండి. మీ చేతులను భారంగా వేలాడనివ్వండి మరియు మెల్లగా ఊపండి. మీ హామ్స్ట్రింగ్స్ మరియు దిగువ వీపులో సాగదీయడం అనుభవించండి.",
          kn: "ನಿಧಾನವಾಗಿ ನಿಮ್ಮ ಸೊಂಟದಲ್ಲಿ ಬಾಗಿ ಮುಂದೆ ಮಡಚಿ. ನಿಮ್ಮ ಕೈಗಳನ್ನು ಭಾರವಾಗಿ ತೂಗಾಡಲು ಬಿಟ್ಟು ಮೆಲ್ಲಗೆ ಅಲುಗಾಡಿಸಿ. ನಿಮ್ಮ ಹ್ಯಾಮ್‌ಸ್ಟ್ರಿಂಗ್‌ಗಳು ಮತ್ತು ಕೆಳ ಬೆನ್ನಿನಲ್ಲಿ ವಿಸ್ತರಣೆಯನ್ನು ಅನುಭವಿಸಿ.",
          bn: "ধীরে ধীরে আপনার নিতম্বে ফোকাস করে সামনের দিকে ভাঁজ করুন। আপনার বাহুগুলি ভারী ভাবে ঝুলতে দিন এবং আলতো করে দুলুন। আপনার হ্যামস্ট্রিং এবং নিম্ন পিঠে প্রসারণ অনুভব করুন।"
        }
      },
      {
        name: { en: "Cat-Cow Stretch", hi: "बिल्ली-गाय खिंचाव", ta: "பூனை-பசு நீட்சி", te: "పిల్లి-ఆవు సాగదీత", kn: "ಬೆಕ್ಕು-ಹಸು ವಿಸ್ತರಣೆ", bn: "বিড়াল-গরু প্রসারণ" },
        duration: 45000,
        instruction: {
          en: "Come to hands and knees. Arch your back and look up (Cow), then round your spine and tuck your chin (Cat). Move with your breath.",
          hi: "हाथ और घुटनों पर आएं। अपनी पीठ को मोड़ें और ऊपर देखें (गाय), फिर अपनी रीढ़ को गोल करें और अपनी ठोड़ी को अंदर करें (बिल्ली)। अपनी सांस के साथ चलें।",
          ta: "கைகள் மற்றும் முழங்கால்களில் வாருங்கள். உங்கள் முதுகை வளைத்து மேலே பாருங்கள் (பசு), பின்னர் உங்கள் முதுகுத்தண்டை வளைத்து தாடையை உள்ளே இழுக்கவும் (பூனை). உங்கள் மூச்சுடன் அசையுங்கள்.",
          te: "చేతులు మరియు మోకాళ్లపై రండి. మీ వీపును వంచి మేలుకు చూడండి (ఆవు), తర్వాత మీ వెన్నెముకను గుండ్రంగా చేసి మీ గడ్డాన్ని లోపలికి లాగండి (పిల్లి). మీ శ్వాసతో కదలండి.",
          kn: "ಕೈಗಳು ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ಬನ್ನಿ. ನಿಮ್ಮ ಬೆನ್ನನ್ನು ಬಾಗಿಸಿ ಮೇಲೆ ನೋಡಿ (ಹಸು), ನಂತರ ನಿಮ್ಮ ಬೆನ್ನುಮೂಳೆಯನ್ನು ಗುಂಡಾಗಿಸಿ ನಿಮ್ಮ ಗಲ್ಲವನ್ನು ಒಳಕ್ಕೆ ಸೆಳೆಯಿರಿ (ಬೆಕ್ಕು). ನಿಮ್ಮ ಉಸಿರಿನೊಂದಿಗೆ ಚಲಿಸಿ.",
          bn: "হাত এবং হাঁটুর উপর আসুন। আপনার পিঠ বাঁকান এবং উপরে তাকান (গরু), তারপর আপনার মেরুদণ্ড গোল করুন এবং আপনার চিবুক ভিতরে টানুন (বিড়াল)। আপনার শ্বাসের সাথে নড়ুন।"
        }
      },
      {
        name: { en: "Sun Salutation A", hi: "सूर्य नमस्कार A", ta: "சூர்ய நமஸ்காரம் A", te: "సూర్య నమస్కారం A", kn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ A", bn: "সূর্য নমস্কার A" },
        duration: 60000,
        instruction: {
          en: "Flow through Mountain Pose, raise arms up, forward fold, half lift, plank, push-up, upward dog, downward dog, and back to mountain. Move with breath.",
          hi: "पर्वत आसन के माध्यम से प्रवाह करें, बाहों को ऊपर उठाएं, आगे की ओर मोड़ें, आधा उठाएं, तख्ता, पुश-अप, ऊपर की ओर कुत्ता, नीचे की ओर कुत्ता, और वापस पर्वत में। सांस के साथ चलें।",
          ta: "மலை நிலை வழியாக பாயுங்கள், கைகளை மேலே உயர்த்துங்கள், முன்னோக்கி மடிப்பு, அரை தூக்குதல், பலகை, புஷ்-அப், மேல்நோக்கி நாய், கீழ்நோக்கி நாய், மற்றும் மீண்டும் மலைக்கு. மூச்சுடன் நகருங்கள்.",
          te: "పర్వత భంగిమ ద్వారా ప్రవహించండi, చేతులను పైకి లేపండి, ముందుకు మడవండి, సగం ఎత్తండి, ప్లాంక్, పుష్-అప్, పైకి కుక్క, క్రిందికి కుక్క, మరియు తిరిగి పర్వతానికి. శ్వాసతో కదలండి.",
          kn: "ಪರ್ವತ ಆಸನದ ಮೂಲಕ ಹರಿಯಿರಿ, ಕೈಗಳನ್ನು ಮೇಲೆ ಎತ್ತಿರಿ, ಮುಂದೆ ಮಡಚಿ, ಅರ್ಧ ಎತ್ತುವಿಕೆ, ಫಲಕ, ಪುಶ್-ಅಪ್, ಮೇಲ್ಮುಖ ನಾಯಿ, ಕೆಳಮುಖ ನಾಯಿ, ಮತ್ತು ಮತ್ತೆ ಪರ್ವತಕ್ಕೆ. ಉಸಿರಿನೊಂದಿಗೆ ಚಲಿಸಿ.",
          bn: "পর্বত ভঙ্গির মাধ্যমে প্রবাহিত হন, বাহু উপরে তুলুন, সামনের দিকে ভাঁজ করুন, অর্ধেক তুলুন, প্ল্যাঙ্ক, পুশ-আপ, ঊর্ধ্বমুখী কুকুর, অধোমুখী কুকুর, এবং পর্বতে ফিরে যান। শ্বাসের সাথে নড়ুন।"
        }
      }
    ]
  },
  stress: {
    name: { en: "Stress Relief", hi: "तनाव राहत", ta: "மன அழுத்த நிவாரணம்", te: "ఒత్తిడి ఉపశమనం", kn: "ಒತ್ತಡ ಪರಿಹಾರ", bn: "চাপ উপশম" },
    description: { en: "Calming poses to release tension", hi: "तनाव मुक्त करने के लिए शांत आसन", ta: "பதற்றத்தை விடுவிக்க அமைதியான நிலைகள்", te: "ఒత్తిడిని విడుదల చేయడానికి ప్రశాంత భంగిమలు", kn: "ಒತ್ತಡವನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲು ಶಾಂತಗೊಳಿಸುವ ಆಸನಗಳು", bn: "টেনশন মুক্ত করার জন্য শান্ত ভঙ্গি" },
    poses: [
      {
        name: { en: "Child's Pose", hi: "बालासन", ta: "குழந்தை நிலை", te: "బాల భంగిమ", kn: "ಬಾಲಾಸನ", bn: "শিশুর ভঙ্গি" },
        duration: 60000,
        instruction: {
          en: "Kneel on the floor, sit back on your heels, and fold forward with arms extended. Rest your forehead on the ground. Breathe deeply and surrender.",
          hi: "फर्श पर घुटने टेकें, अपनी एड़ी पर वापस बैठें, और हाथों को फैलाकर आगे की ओर मुड़ें। अपना माथा जमीन पर टिकाएं। गहरी सांस लें और समर्पण करें।",
          ta: "தரையில் மண்டியிட்டு, உங்கள் குதிகால்களில் மீண்டும் அமர்ந்து, கைகளை நீட்டி முன்னோக்கி மடிக்கவும். உங்கள் நெற்றியை தரையில் வைக்கவும். ஆழமாக மூச்சு விட்டு சரணடையுங்கள்.",
          te: "నేలపై మోకాళ్లపై కూర్చుని, మీ మడమలపై తిరిగి కూర్చుని, చేతులను విస్తరించి ముందుకు మడవండి. మీ నుదుటిని నేలపై ఉంచండి. లోతుగా శ్వసించి లొంగిపోండి.",
          kn: "ನೆಲದ ಮೇಲೆ ಮಂಡಿಯೂರಿ, ನಿಮ್ಮ ಹಿಮ್ಮಡಿಗಳ ಮೇಲೆ ಹಿಂದೆ ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ಕೈಗಳನ್ನು ವಿಸ್ತರಿಸಿ ಮುಂದೆ ಮಡಚಿ. ನಿಮ್ಮ ಹಣೆಯನ್ನು ನೆಲದ ಮೇಲೆ ಇರಿಸಿ. ಆಳವಾಗಿ ಉಸಿರಾಡಿ ಮತ್ತು ಶರಣಾಗತಿ ಹೊಂದಿ.",
          bn: "মেঝেতে হাঁটু গেড়ে বসুন, আপনার গোড়ালিতে ফিরে বসুন এবং বাহু প্রসারিত করে সামনের দিকে ভাঁজ করুন। আপনার কপাল মাটিতে রাখুন। গভীর শ্বাস নিন এবং আত্মসমর্পণ করুন।"
        }
      },
      {
        name: { en: "Legs Up The Wall", hi: "दीवार पर पैर", ta: "சுவரில் கால்கள்", te: "గోడపై కాళ్లు", kn: "ಗೋಡೆಯ ಮೇಲೆ ಕಾಲುಗಳು", bn: "দেয়ালে পা" },
        duration: 120000,
        instruction: {
          en: "Lie on your back near a wall and extend your legs up the wall. Let your arms rest by your sides. Close your eyes and focus on your breath.",
          hi: "दीवार के पास अपनी पीठ के बल लेटें और अपने पैरों को दीवार पर फैलाएं। अपनी बाहों को अपनी तरफ आराम दें। अपनी आँखें बंद करें और अपनी सांस पर ध्यान दें।",
          ta: "சுவருக்கு அருகில் உங்கள் முதுகில் படுத்துக் கொள்ளுங்கள் மற்றும் உங்கள் கால்களை சுவரில் நீட்டுங்கள். உங்கள் கைகளை உங்கள் பக்கவாட்டில் ஓய்வெடுக்க விடுங்கள். உங்கள் கண்களை மூடி உங்கள் மூச்சில் கவனம் செலுத்துங்கள்.",
          te: "గోడకు దగ్గరగా మీ వీపుపై పడుకుని మీ కాళ్లను గోడపై విస్తరించండి. మీ చేతులను మీ వైపులా విశ్రాంతి తీసుకోనివ్వండి. మీ కళ్లను మూసుకుని మీ శ్వాసపై దృష్టి పెట్టండి.",
          kn: "ಗೋಡೆಯ ಬಳಿ ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ ಮತ್ತು ನಿಮ್ಮ ಕಾಲುಗಳನ್ನು ಗೋಡೆಯ ಮೇಲೆ ವಿಸ್ತರಿಸಿ. ನಿಮ್ಮ ಕೈಗಳನ್ನು ನಿಮ್ಮ ಬದಿಗಳಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಮಾಡಲು ಬಿಡಿ. ನಿಮ್ಮ ಕಣ್ಣುಗಳನ್ನು ಮುಚ್ಚಿ ಮತ್ತು ನಿಮ್ಮ ಉಸಿರಿನ ಮೇಲೆ ಗಮನಹರಿಸಿ.",
          bn: "দেয়ালের কাছে আপনার পিঠে শুয়ে পড়ুন এবং আপনার পা দেয়ালে প্রসারিত করুন। আপনার বাহু আপনার পাশে বিশ্রাম নিতে দিন। আপনার চোখ বন্ধ করুন এবং আপনার শ্বাসে মনোনিবেশ করুন।"
        }
      },
      {
        name: { en: "Spinal Twist", hi: "रीढ़ की हड्डी का मोड़", ta: "முதுகுத்தண்டு திருப்பம்", te: "వెన్నెముక మలుపు", kn: "ಬೆನ್ನುಮೂಳೆಯ ತಿರುವು", bn: "মেরুদণ্ডের মোড়" },
        duration: 45000,
        instruction: {
          en: "Sit with legs extended, bend one knee and place foot outside opposite thigh. Twist gently towards the bent knee. Hold and breathe, then switch sides.",
          hi: "पैरों को फैलाकर बैठें, एक घुटने को मोड़ें और पैर को विपरीत जांघ के बाहर रखें। मुड़े हुए घुटने की ओर धीरे से मुड़ें। पकड़ें और सांस लें, फिर पक्षों को बदलें।",
          ta: "கால்களை நீட்டி அமர்ந்து, ஒரு முழங்காலை வளைத்து எதிர் தொடையின் வெளியே பாதத்தை வைக்கவும். வளைந்த முழங்காலை நோக்கி மெதுவாக திருப்புங்கள். பிடித்து மூச்சு விடுங்கள், பின்னர் பக்கங்களை மாற்றுங்கள்.",
          te: "కాళ్లను విస్తరించి కూర్చుని, ఒక మోకాలిని వంచి ఎదురుగా ఉన్న తొడ వెలుపల పాదాన్ని ఉంచండి. వంగిన మోకాలి వైపు మెల్లగా తిరుగుతూ ఉండండి. పట్టుకుని శ్వసించండి, తర్వాత వైపులను మార్చండి.",
          kn: "ಕಾಲುಗಳನ್ನು ವಿಸ್ತರಿಸಿ ಕುಳಿತುಕೊಳ್ಳಿ, ಒಂದು ಮೊಣಕಾಲನ್ನು ಬಾಗಿಸಿ ಮತ್ತು ವಿರುದ್ಧ ತೊಡೆಯ ಹೊರಗೆ ಪಾದವನ್ನು ಇರಿಸಿ. ಬಾಗಿದ ಮೊಣಕಾಲಿನ ಕಡೆಗೆ ಮೃದುವಾಗಿ ತಿರುಗಿ. ಹಿಡಿದು ಉಸಿರಾಡಿ, ನಂತರ ಬದಿಗಳನ್ನು ಬದಲಾಯಿಸಿ.",
          bn: "পা প্রসারিত করে বসুন, একটি হাঁটু বাঁকুন এবং পা বিপরীত উরুর বাইরে রাখুন। বাঁকানো হাঁটুর দিকে আলতো করে মোচড় দিন। ধরুন এবং শ্বাস নিন, তারপর পাশ পরিবর্তন করুন।"
        }
      }
    ]
  },
  bedtime: {
    name: { en: "Bedtime Yoga", hi: "सोने से पहले योग", ta: "படுக்கைக்கு முன் யோகா", te: "నిద్రకు ముందు యోగా", kn: "ಮಲಗುವ ಮೊದಲು ಯೋಗ", bn: "শোবার আগে যোগব্যায়াম" },
    description: { en: "Gentle stretches to prepare for sleep", hi: "नींद के लिए तैयार होने के लिए कोमल खिंचाव", ta: "தூக்கத்திற்கு தயார் செய்ய மெல்லிய நீட்சிகள்", te: "నిద్రకు సిద్ధం కావడానికి మృదువైన సాగదీత", kn: "ನಿದ್ರೆಗೆ ಸಿದ್ಧವಾಗಲು ಮೃದುವಾದ ವಿಸ್ತರಣೆಗಳು", bn: "ঘুমের জন্য প্রস্তুত হওয়ার জন্য মৃদু প্রসারণ" },
    poses: [
      {
        name: { en: "Gentle Neck Rolls", hi: "कोमल गर्दन रोल", ta: "மென்மையான கழுத்து உருட்டல்", te: "మృదువైన మెడ తిప్పడం", kn: "ಮೃದುವಾದ ಕುತ್ತಿಗೆ ತಿರುಗಿಸುವಿಕೆ", bn: "মৃদু ঘাড় রোল" },
        duration: 30000,
        instruction: {
          en: "Sit comfortably and slowly roll your head in gentle circles. Release any tension from your neck and shoulders. Breathe deeply.",
          hi: "आराम से बैठें और धीरे-धीरे अपने सिर को कोमल वृत्तों में घुमाएं। अपनी गर्दन और कंधों से किसी भी तनाव को मुक्त करें। गहरी सांस लें।",
          ta: "வசதியாக அமர்ந்து உங்கள் தலையை மெதுவாக மென்மையான வட்டங்களில் சுழற்றுங்கள். உங்கள் கழுத்து மற்றும் தோள்களில் இருந்து எந்த பதற்றத்தையும் விடுவிக்கவும். ஆழமாக மூச்சு விடுங்கள்.",
          te: "హాయిగా కూర్చుని మీ తలను నెమ్మదిగా మృదువైన వృత్తాలలో తిప్పండి. మీ మెడ మరియు భుజాల నుండి ఏదైనా ఒత్తిడిని విడుదల చేయండి. లోతుగా శ్వసించండి.",
          kn: "ಆರಾಮವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ನಿಧಾನವಾಗಿ ನಿಮ್ಮ ತಲೆಯನ್ನು ಮೃದುವಾದ ವಲಯಗಳಲ್ಲಿ ತಿರುಗಿಸಿ. ನಿಮ್ಮ ಕುತ್ತಿಗೆ ಮತ್ತು ಭುಜಗಳಿಂದ ಯಾವುದೇ ಒತ್ತಡವನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿ. ಆಳವಾಗಿ ಉಸಿರಾಡಿ.",
          bn: "আরামে বসুন এবং ধীরে ধীরে আপনার মাথা মৃদু বৃত্তে ঘুরান। আপনার ঘাড় এবং কাঁধ থেকে যে কোনও টেনশন মুক্ত করুন। গভীর শ্বাস নিন।"
        }
      },
      {
        name: { en: "Supine Spinal Twist", hi: "सुपाइन स्पाइनल ट्विस्ট", ta: "மல்லாந்த முதுகுத்தண்டு திருப்பம்", te: "పల్లకీ వెన్నెముక మలుపు", kn: "ಸುಪೈನ್ ಬೆನ್ನುಮೂಳೆಯ ತಿರುವು", bn: "শুয়ে থাকা মেরুদণ্ডের মোড়" },
        duration: 60000,
        instruction: {
          en: "Lie on your back, hug knees to chest, then drop both knees to one side. Keep shoulders on the ground. Hold, breathe, then switch sides.",
          hi: "अपनी पीठ के बल लेटें, घुटनों को छाती से लगाएं, फिर दोनों घुटनों को एक तरफ गिराएं। कंधों को जमीन पर रखें। पकड़ें, सांस लें, फिर पक्षों को बदलें।",
          ta: "உங்கள் முதுகில் படுத்துக் கொள்ளுங்கள், முழங்கால்களை மார்பில் கட்டி, பின்னர் இரு முழங்கால்களையும் ஒரு பக்கமாக விடுங்கள். தோள்களை தரையில் வைக்கவும். பிடித்து, மூச்சு விட்டு, பின்னர் பக்கங்களை மாற்றுங்கள்.",
          te: "మీ వీపుపై పడుకుని, మోకాళ్లను ఛాతీకి కట్టుకుని, తర్వాత రెండు మోకాళ్లను ఒక వైపుకు వదలండి. భుజాలను నేలపై ఉంచండి. పట్టుకుని, శ్వసించి, తర్వాత వైపులను మార్చండి.",
          kn: "ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ಮೊಣಕಾಲುಗಳನ್ನು ಎದೆಗೆ ಅಲಿಂಗನ ಮಾಡಿ, ನಂತರ ಎರಡೂ ಮೊಣಕಾಲುಗಳನ್ನು ಒಂದು ಬದಿಗೆ ಬಿಡಿ. ಭುಜಗಳನ್ನು ನೆಲದ ಮೇಲೆ ಇರಿಸಿ. ಹಿಡಿದು, ಉಸಿರಾಡಿ, ನಂತರ ಬದಿಗಳನ್ನು ಬದಲಾಯಿಸಿ.",
          bn: "আপনার পিঠে শুয়ে পড়ুন, হাঁটু বুকে জড়িয়ে ধরুন, তারপর উভয় হাঁটু এক পাশে ফেলুন। কাঁধ মাটিতে রাখুন। ধরুন, শ্বাস নিন, তারপর পাশ পরিবর্তন করুন।"
        }
      },
      {
        name: { en: "Happy Baby Pose", hi: "खुश बच्चा आसन", ta: "மகிழ்ச்சியான குழந்தை நிலை", te: "సంతోషకరమైన బిడ్డ భంగిమ", kn: "ಸಂತೋಷದ ಮಗುವಿನ ಆಸನ", bn: "খুশি শিশুর ভঙ্গি" },
        duration: 45000,
        instruction: {
          en: "Lie on your back, grab the outer edges of your feet, and gently rock side to side. Keep knees wide and relax your lower back.",
          hi: "अपनी पीठ के बल लेटें, अपने पैरों के बाहरी किनारों को पकड़ें, और धीरे-धीरे बगल से बगल में हिलाएं। घुटनों को चौड़ा रखें और अपनी पीठ के निचले हिस्से को आराम दें।",
          ta: "உங்கள் முதுகில் படுத்து, உங்கள் பாதங்களின் வெளிப்புற விளிம்புகளை பிடித்து, மெதுவாக பக்கத்திலிருந்து பக்கமாக ஆடுங்கள். முழங்கால்களை அகலமாக வைத்து உங்கள் கீழ் முதுகை தளர்த்துங்கள்.",
          te: "మీ వీపుపై పడుకుని, మీ పాదాల బయటి అంచులను పట్టుకుని, మెల్లగా పక్కనుండి పక్కకు ఊగండి. మోకాళ్లను వెడల్పుగా ఉంచి మీ దిగువ వీపును విశ్రాంతి తీసుకోనివ്వండి.",
          kn: "ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಮಲಗಿ, ನಿಮ್ಮ ಪಾದಗಳ ಹೊರ ಅಂಚುಗಳನ್ನು ಹಿಡಿಯಿರಿ ಮತ್ತು ಮೃದುವಾಗಿ ಬದಿಯಿಂದ ಬದಿಗೆ ಅಲುಗಾಡಿಸಿ. ಮೊಣಕಾಲುಗಳನ್ನು ಅಗಲವಾಗಿ ಇರಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಕೆಳ ಬೆನ್ನನ್ನು ವಿಶ್ರಾಂತಿ ಮಾಡಿ.",
          bn: "আপনার পিঠে শুয়ে পড়ুন, আপনার পায়ের বাইরের প্রান্ত ধরুন এবং আলতো করে পাশে পাশে দুলুন। হাঁটু প্রশস্ত রাখুন এবং আপনার নিম্ন পিঠ শিথিল করুন।"
        }
      },
      {
        name: { en: "Savasana", hi: "शवासन", ta: "சவாசனம்", te: "శవాసనం", kn: "ಶವಾಸನ", bn: "শবাসন" },
        duration: 180000,
        instruction: {
          en: "Lie flat on your back with arms by your sides, palms up. Close your eyes and allow your body to completely relax. Focus on your breath and let go of the day.",
          hi: "अपनी बाहों को अपनी तरफ, हथेलियों को ऊपर करके अपनी पीठ के बल सपाट लेटें। अपनी आँखें बंद करें और अपने शरीर को पूरी तरह से आराम करने दें। अपनी सांस पर ध्यान दें और दिन को जाने दें।",
          ta: "உங்கள் கைகளை உங்கள் பக்கத்தில், உள்ளங்கைகளை மேலே வைத்து உங்கள் முதுகில் தட்டையாக படுத்துக் கொள்ளுங்கள். உங்கள் கண்களை மூடி உங்கள் உடலை முழுமையாக தளர்த்த அனுமதியுங்கள். உங்கள் மூச்சில் கவனம் செலுத்தி நாளை விட்டுவிடுங்கள்.",
          te: "మీ చేతులను మీ వైపులా, అరచేతులను పైకి చేసి మీ వీపుపై చదును­గా పడుకోండి. మీ కళ్లను మూసుకుని మీ శరీరాన్ని పూర్తిగా విశ్రాంతి తీసుకోనివ్వండి. మీ శ్వాసపై దృష్టి పెట్టి రోజును వదిలేయండి.",
          kn: "ನಿಮ್ಮ ಕೈಗಳನ್ನು ನಿಮ್ಮ ಬದಿಗಳಲ್ಲಿ, ಅಂಗೈಗಳನ್ನು ಮೇಲಕ್ಕೆ ಇಟ್ಟುಕೊಂಡು ನಿಮ್ಮ ಬೆನ್ನಿನ ಮೇಲೆ ಚಪ್ಪಟೆಯಾಗಿ ಮಲಗಿ. ನಿಮ್ಮ ಕಣ್ಣುಗಳನ್ನು ಮುಚ್ಚಿ ಮತ್ತು ನಿಮ್ಮ ದೇಹವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿಶ್ರಾಂತಿ ಮಾಡಲು ಅನುಮತಿಸಿ. ನಿಮ್ಮ ಉಸಿರಿನ ಮೇಲೆ ಗಮನಹರಿಸಿ ಮತ್ತು ದಿನವನ್ನು ಬಿಟ್ಟುಬಿಡಿ.",
          bn: "আপনার বাহু পাশে, তালু উপরে রেখে আপনার পিঠে সমতল হয়ে শুয়ে পড়ুন। আপনার চোখ বন্ধ করুন এবং আপনার শরীরকে সম্পূর্ণভাবে শিথিল হতে দিন। আপনার শ্বাসে মনোনিবেশ করুন এবং দিনটি ছেড়ে দিন।"
        }
      }
    ]
  }
};

export const YogaStretching = ({ onBack }: YogaStretchingProps) => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedSequence, setSelectedSequence] = useState<'morning' | 'stress' | 'bedtime'>('morning');
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const poseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const sequence = yogaSequences[selectedSequence];
  const currentPose = sequence.poses[currentPoseIndex];

  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            return currentPose?.duration || 0;
          }
          return prev - 100;
        });
      }, 100);

      if (currentPose) {
        poseTimeoutRef.current = setTimeout(() => {
          if (currentPoseIndex < sequence.poses.length - 1) {
            setCurrentPoseIndex(prev => prev + 1);
            setTimeLeft(sequence.poses[currentPoseIndex + 1]?.duration || 0);
          } else {
            setIsActive(false);
            setIsCompleted(true);
          }
        }, currentPose.duration);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);
    };
  }, [isActive, currentPoseIndex, sequence, currentPose, isCompleted]);

  // Play audio instructions
  useEffect(() => {
    if (isActive && currentPose && soundEnabled) {
      const instruction = currentPose.instruction[language];
      playTextToSpeech(instruction);
    }
  }, [currentPoseIndex, isActive, soundEnabled, language]);

  const toggleSession = () => {
    if (isCompleted) {
      resetSession();
    } else {
      setIsActive(!isActive);
      if (!isActive && currentPoseIndex === 0) {
        setTimeLeft(currentPose?.duration || 0);
      }
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentPoseIndex(0);
    setTimeLeft(0);
    setIsCompleted(false);
    stopCurrentAudio();
  };

  const skipToNext = () => {
    if (currentPoseIndex < sequence.poses.length - 1) {
      setCurrentPoseIndex(prev => prev + 1);
      setTimeLeft(sequence.poses[currentPoseIndex + 1]?.duration || 0);
    }
  };

  const handleSequenceChange = (seq: 'morning' | 'stress' | 'bedtime') => {
    if (!isActive) {
      setSelectedSequence(seq);
      resetSession();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = sequence.poses.length > 0 ? ((currentPoseIndex + 1) / sequence.poses.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </Button>
              <div className="flex items-center gap-2">
                <LanguageSelector language={language} onLanguageChange={setLanguage} />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">{t.yoga}</CardTitle>
            <p className="text-muted-foreground">{t.yogaDesc}</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Progress Bar */}
            {(isActive || isCompleted) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{sequence.name[language]}</span>
                  <span>{currentPoseIndex + 1} / {sequence.poses.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Sequence Selection */}
            {!isActive && !isCompleted && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{t.choosePose}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.keys(yogaSequences) as Array<keyof typeof yogaSequences>).map((key) => {
                    const seq = yogaSequences[key];
                    return (
                      <Card 
                        key={key}
                        className={`cursor-pointer transition-all ${
                          selectedSequence === key 
                            ? 'ring-2 ring-primary bg-gradient-secondary' 
                            : 'hover:shadow-gentle'
                        }`}
                        onClick={() => handleSequenceChange(key)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">
                            {key === 'morning' && '🌅'}
                            {key === 'stress' && '🧘‍♀️'}
                            {key === 'bedtime' && '🌙'}
                          </div>
                          <div className="font-medium mb-1">{seq.name[language]}</div>
                          <div className="text-xs text-muted-foreground">{seq.description[language]}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Pose Display */}
            {(isActive || isCompleted) && currentPose && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-primary">
                    {currentPose.name[language]}
                  </h3>
                  
                  {/* Timer Display */}
                  <div className="flex justify-center">
                    <div 
                      className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl"
                      style={{
                        boxShadow: '0 0 30px hsl(var(--primary) / 0.3)'
                      }}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  {/* Instruction */}
                  {!isCompleted && (
                    <div className="max-w-2xl mx-auto">
                      <div className="p-6 bg-gradient-secondary rounded-lg border border-accent-foreground/20">
                        <p className="text-lg leading-relaxed text-accent-foreground">
                          {currentPose.instruction[language]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {isCompleted && (
              <div className="text-center p-8 bg-gradient-primary rounded-lg text-white">
                <h3 className="text-2xl font-bold mb-4">{t.wellDone}</h3>
                <p className="text-lg mb-4">
                  You've completed the {sequence.name[language].toLowerCase()} sequence.
                </p>
                <p className="opacity-90">
                  Take a moment to notice how your body feels after this practice.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleSession}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    {t.start} New Session
                  </>
                ) : isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    {t.pause}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {currentPoseIndex === 0 ? t.start : t.resume}
                  </>
                )}
              </Button>
              
              {isActive && !isCompleted && (
                <Button 
                  onClick={skipToNext}
                  variant="outline"
                  size="lg"
                  disabled={currentPoseIndex >= sequence.poses.length - 1}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  {t.nextPose}
                </Button>
              )}
              
              {(isActive || isCompleted || currentPoseIndex > 0) && (
                <Button 
                  onClick={resetSession}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t.reset}
                </Button>
              )}
            </div>

            {/* Instructions */}
            {!isActive && !isCompleted && currentPoseIndex === 0 && (
              <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                <h4 className="font-semibold text-accent-foreground mb-2">{t.gettingStarted}</h4>
                <div className="text-accent-foreground/80 text-sm space-y-2">
                  <p>• Find a quiet space with room to move</p>
                  <p>• Wear comfortable clothing that allows movement</p>
                  <p>• Listen to your body and don't force any pose</p>
                  <p>• Breathe deeply and stay present with each movement</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};