/**
 * NumeRead Game Tutorial & Moving Spotlight System
 * Provides an interactive, animated onboarding tutorial for every game with
 * a moving rounded square spotlight, darkened backdrop, bilingual (EN/FIL) support,
 * and an expressive, engaging female/natural teacher voice.
 */

(function () {
  // Bilingual step configurations tailored for all NumeRead games
  const TUTORIAL_STEPS = {
    "reading-bridge": {
      en: [
        {
          target: "#lessonContainer, .lesson-bubble",
          title: "Phonics Secret Rule 💡",
          desc: "Read the <strong>mini lesson tip</strong> first! It teaches you how the two beginning consonant sounds blend smoothly together.",
          tip: "Keep both sounds intact: for <em>bl</em>, say /b/ and /l/ smoothly as in <em>blue</em>!",
          speech: "Phonics Secret Rule. Read the mini lesson tip first to learn how the beginning sounds blend together."
        },
        {
          target: ".prompt-card, #promptText",
          title: "Listen for the Blend 🎧",
          desc: "Check the starting blend letters in the prompt. You can tap <strong>Listen to Sound</strong> to hear the narrator pronounce the blend!",
          tip: "Listening helps connect the written letters with their spoken sound.",
          speech: "Listen for the Blend. Check the blend letters, or tap Listen to Sound to hear the sound aloud."
        },
        {
          target: "#choicesContainer",
          title: "Pick the Matching Word 🪨",
          desc: "Look at the word choices and tap the tile that begins with the target blend. Every correct answer places a stepping stone in the water!",
          tip: "If you get it right, you earn score points and build your combo streak!",
          speech: "Pick the Matching Word. Tap the word that begins with the sound to lay a stepping stone."
        },
        {
          target: "#riverStage, .river-stage",
          title: "Cross the River Bridge! 🌉",
          desc: "Watch your brave walker advance stone-by-stone across the river. Complete all rounds to reach the castle and record your XP!",
          tip: "Finish all 5 rounds to unlock special reading badges!",
          speech: "Cross the River Bridge! Guide your character across the river to reach the castle and win!"
        }
      ],
      fil: [
        {
          target: "#lessonContainer, .lesson-bubble",
          title: "Lihim sa Pagbasa 💡",
          desc: "Basahin muna ang <strong>maikling aralin</strong>! Itinuturo nito kung paano maayos na pinagsasama ang dalawang tunog ng katinig.",
          tip: "Panatilihin ang dalawang tunog: sa <em>bl</em>, bigkasin nang tuloy-tuloy ang /b/ at /l/ gaya ng <em>blue</em>!",
          speech: "Lihim sa Pagbasa. Basahin muna ang maikling aralin upang malaman kung paano pinagsasama ang mga tunog."
        },
        {
          target: ".prompt-card, #promptText",
          title: "Pakinggan ang Tunog 🎧",
          desc: "Tingnan ang mga letra ng blend sa tanong. Maaari mong pindutin ang <strong>Pakinggan ang Tunog</strong> upang marinig ang tamang pagbigkas!",
          tip: "Nakatutulong ang pakikinig upang maiugnay ang letra sa tunog nito.",
          speech: "Pakinggan ang Tunog. Tingnan ang mga letra o pindutin ang Pakinggan ang Tunog upang marinig ito nang malinaw."
        },
        {
          target: "#choicesContainer",
          title: "Piliin ang Tamang Salita 🪨",
          desc: "Piliin ang salitang nagsisimula sa tunog na hinahanap. Bawat tamang sagot ay maglalagay ng batong tapakan sa ilog!",
          tip: "Kapag tama ang iyong sagot, makakakuha ka ng puntos at streak!",
          speech: "Piliin ang Tamang Salita. Pindutin ang salitang nagsisimula sa tunog upang maglagay ng bato sa ilog."
        },
        {
          target: "#riverStage, .river-stage",
          title: "Tawirin ang Tulay ng Ilog! 🌉",
          desc: "Tingnan ang iyong manlalaro habang tumatawid sa mga bato ng ilog patungo sa kastilyo upang manalo at magtala ng XP!",
          tip: "Tapusin ang 5 ikot para makamit ang mga natatanging badge sa pagbasa!",
          speech: "Tawirin ang Tulay ng Ilog! Gabayan ang iyong karakter patawid sa ilog patungo sa kastilyo upang manalo!"
        }
      ]
    },

    "math-ninja": {
      en: [
        {
          target: ".ninja-lesson, #lessonContainer, .lesson-bubble",
          title: "Ninja Addition Scroll 📜",
          desc: "Read the secret ninja strategy! Addition brings two amounts together. Start with the bigger number and count on.",
          tip: "Making ten first is a lightning-fast ninja shortcut!",
          speech: "Ninja Addition Scroll. Read the secret ninja tip: start with the bigger number and count on."
        },
        {
          target: ".ninja-prompt, .prompt-card, #promptText",
          title: "The Math Challenge 🥷",
          desc: "Examine the addition equation in the center. Tap the speaker icon if you want the problem read aloud to you.",
          tip: "Take a deep breath and visualize the total amount.",
          speech: "The Math Challenge. Look at the addition equation in the center, or tap the speaker to hear it."
        },
        {
          target: "#tenFrameStage, .ten-frame-container",
          title: "Ten-Frames Helper 🔴",
          desc: "Use the visual ten-frames! The colored ninja dots show the two addends clearly so you can count or group them by tens.",
          tip: "Full ten-frames equal 10. Just add the extra dots in the second frame!",
          speech: "Ten-Frames Helper. Count the colored dots in the ten-frames to help you see the answer."
        },
        {
          target: "#choicesContainer, .ninja-choices",
          title: "Strike the Answer! ⚡",
          desc: "Tap the correct shuriken answer button to strike! Quick and accurate answers charge your ninja power bar and multiply combos.",
          tip: "Complete all 5 rounds to earn your Ninja Master reward!",
          speech: "Strike the Answer! Tap the correct answer button to score points and build your combo."
        }
      ],
      fil: [
        {
          target: ".ninja-lesson, #lessonContainer, .lesson-bubble",
          title: "Araling Ninja sa Addition 📜",
          desc: "Basahin ang sikreto ng ninja! Ang addition ay pagsasama ng dalawang bilang. Simulan sa mas malaking bilang at magbilang pasulong.",
          tip: "Ang pagbuo muna ng sampu (ten) ay mabilis na paraan ng ninja!",
          speech: "Araling Ninja sa Addition. Basahin ang sikreto ng ninja: simulan sa mas malaking bilang at magbilang pasulong."
        },
        {
          target: ".ninja-prompt, .prompt-card, #promptText",
          title: "Ang Hamon sa Matematika 🥷",
          desc: "Suriin ang equation ng addition sa gitna. Pindutin ang speaker icon kung nais mong marinig ang tanong.",
          tip: "Huminga nang malalim at isipin ang kabuuang bilang.",
          speech: "Ang Hamon sa Matematika. Tingnan ang tanong sa gitna o pindutin ang speaker upang marinig ito."
        },
        {
          target: "#tenFrameStage, .ten-frame-container",
          title: "Gabay na Ten-Frames 🔴",
          desc: "Gamitin ang ten-frames! Ipinapakita ng mga kulay na tuldok ang mga bilang upang madaling mabilang nang pangkatan.",
          tip: "Ang punong ten-frame ay katumbas ng 10. Idagdag lamang ang mga karagdagang tuldok!",
          speech: "Gabay na Ten-Frames. Gamitin ang mga tuldok sa ten-frames upang madaling makita ang sagot."
        },
        {
          target: "#choicesContainer, .ninja-choices",
          title: "Hampasin ang Tamang Sagot! ⚡",
          desc: "Pindutin ang shuriken na may tamang sagot! Ang mabilis at wastong sagot ay nagpapalakas ng iyong kapangyarihang ninja at nagpaparami ng puntos.",
          tip: "Tapusin ang 5 ikot upang makamit ang Ninja Master reward!",
          speech: "Hampasin ang Tamang Sagot! Pindutin ang shuriken ng tamang sagot upang magtala ng mataas na puntos."
        }
      ]
    },

    "word-bakery": {
      en: [
        {
          target: ".story-panel, #storyText",
          title: "Read the Customer Order 🥐",
          desc: "Read the customer's bakery story order carefully. Tap the speaker icon anytime to hear the story narrated aloud.",
          tip: "Pay close attention to the numbers and what is happening in the story!",
          speech: "Read the Customer Order. Read the story carefully, or tap the speaker to listen to the order."
        },
        {
          target: ".op-grid, #opAddBtn",
          title: "Pick the Operation ➕➖",
          desc: "Decide which operation is needed! Did the bakery receive <strong>more items (Add +)</strong>, or were items <strong>sold and taken away (Subtract -)</strong>?",
          tip: "Key words like 'gives away' or 'eaten' mean subtract. 'Receives' or 'more' mean add!",
          speech: "Pick the Operation. Choose whether the story joins items together with addition, or takes them away with subtraction."
        },
        {
          target: "#choicesContainer, .bakery-choices",
          title: "Bake the Recipe Answer! 🧁",
          desc: "Calculate the final number and tap the matching recipe card to bake the order for the waiting customer.",
          tip: "Double check your math before tapping to keep your streak hot!",
          speech: "Bake the Recipe Answer. Tap the matching recipe answer to finish baking the order."
        },
        {
          target: "#bakeryTray, .bakery-tray-stage",
          title: "Fill the Bakery Showcase 🥨",
          desc: "Every correct order bakes delicious pastries right onto your display tray. Fulfill all 5 orders to finish your bakery shift!",
          tip: "Watch the golden croissants, pretzels, and cupcakes appear on the tray!",
          speech: "Fill the Bakery Showcase. Watch fresh baked pastries fill your tray with every correct order."
        }
      ],
      fil: [
        {
          target: ".story-panel, #storyText",
          title: "Basahin ang Kuwento ng Order 🥐",
          desc: "Basahing mabuti ang order ng mamimili. Pindutin ang speaker icon upang marinig ang pagsasalaysay ng kuwento.",
          tip: "Bigyang-pansin ang mga numero at ang nangyayari sa kuwento!",
          speech: "Basahin ang Kuwento ng Order. Pakinggan o basahin nang maigi ang kuwento ng mamimili sa panaderya."
        },
        {
          target: ".op-grid, #opAddBtn",
          title: "Piliin ang Operasyon ➕➖",
          desc: "Alamin kung anong operasyon ang kailangan! Nadagdagan ba ang tinapay (<strong>Add +</strong>), o may nabawas at kinain (<strong>Subtract -</strong>)?",
          tip: "Ang mga salitang 'kinain' o 'ibinigay' ay bawas (-). Ang 'dumating' o 'dinagdagan' ay dagdag (+)!",
          speech: "Piliin ang Operasyon. Alamin kung ang kuwento ay nagdagdag o nagbawas ng mga tinapay."
        },
        {
          target: "#choicesContainer, .bakery-choices",
          title: "Lutuin ang Sagot sa Resipe! 🧁",
          desc: "Kalkulahin ang bilang at pindutin ang katugmang resipe upang maihain ang tinapay sa naghihintay na mamimili.",
          tip: "Suriing mabuti ang iyong kalkulasyon bago pumindot!",
          speech: "Lutuin ang Sagot sa Resipe! Piliin ang tamang bilang upang matapos ang pagluluto."
        },
        {
          target: "#bakeryTray, .bakery-tray-stage",
          title: "Punuin ang Lagayan ng Tinapay 🥨",
          desc: "Bawat tamang sagot ay nagluluto ng masasarap na tinapay sa iyong tray. Kumpletuhin ang 5 order upang matapos ang iyong shift!",
          tip: "Tingnan ang mga croissant, pretzel, at cupcake na lumilitaw sa tray!",
          speech: "Punuin ang Lagayan ng Tinapay. Panoorin ang masasarap na tinapay na pupuno sa iyong tray!"
        }
      ]
    },

    "sentence-builder": {
      en: [
        {
          target: "#lessonContainer, .lesson-bubble",
          title: "Sentence Blueprint 📐",
          desc: "Review your sentence fluency tip! Sentences begin with a capital letter, end with punctuation, and must make sense in order.",
          tip: "Ask yourself: 'Who is doing what in this sentence?'",
          speech: "Sentence Blueprint. Sentences start with capital letters and must make sense when read in order."
        },
        {
          target: "#wordsContainer, .words-grid",
          title: "Tap Word Tiles 🔤",
          desc: "Tap the word tiles one by one. They will smoothly snap into the sentence track in the exact order you choose.",
          tip: "Made a mistake? Tap 'Clear Slots' to reset the tiles and try a new order.",
          speech: "Tap Word Tiles. Tap the word tiles in order to build your sentence in the track."
        },
        {
          target: ".slots-container, #sentenceSlotsTrack",
          title: "Read to Me Check 🎧",
          desc: "Once all word tiles are placed, tap <strong>Read to Me</strong>! Listen to your completed sentence to verify it sounds natural and grammatical.",
          tip: "Listening helps catch words that might be out of order!",
          speech: "Read to Me Check. Tap Read to Me to hear your sentence read aloud and confirm it makes sense."
        },
        {
          target: "#questionSection, .question-section",
          title: "Comprehension Question ❓",
          desc: "Now answer the comprehension question below your sentence! Proving that you understand the story gives you full credit and XP.",
          tip: "Look right back at your built sentence to find the direct evidence!",
          speech: "Comprehension Question. Answer the question about your sentence to complete the round and earn points."
        }
      ],
      fil: [
        {
          target: "#lessonContainer, .lesson-bubble",
          title: "Plano sa Paggawa ng Pangungusap 📐",
          desc: "Balikan ang paalala sa pagbuo! Ang pangungusap ay nagsisimula sa malaking titik, nagtatapos sa bantas, at may buong kaisipan.",
          tip: "Tanungin ang sarili: 'Sino ang gumagawa at ano ang ginagawa sa pangungusap?'",
          speech: "Plano sa Paggawa ng Pangungusap. Ang pangungusap ay nagsisimula sa malaking titik at may buong diwa."
        },
        {
          target: "#wordsContainer, .words-grid",
          title: "Pindutin ang mga Salita 🔤",
          desc: "Isa-isang pindutin ang mga salita. Lalapat ang mga ito sa linya ng pangungusap ayon sa iyong piniling pagkakasunod-sunod.",
          tip: "Nagkamali? Pindutin ang 'Clear Slots' upang i-reset at subukan muli.",
          speech: "Pindutin ang mga Salita. Pindutin ang mga salita upang buuin ang tamang pangungusap."
        },
        {
          target: ".slots-container, #sentenceSlotsTrack",
          title: "Makinig at Suriin 🎧",
          desc: "Kapag nailagay na ang mga salita, pindutin ang <strong>Basahin Para sa Akin</strong>! Pakinggan ang pangungusap upang matiyak na tama ang diwa nito.",
          tip: "Nakatutulong ang pakikinig upang matukoy kung may salitang baligtad ang ayos!",
          speech: "Makinig at Suriin. Pakinggan ang nabuong pangungusap upang masigurong tama ang kahulugan nito."
        },
        {
          target: "#questionSection, .question-section",
          title: "Sagutin ang Tanong ❓",
          desc: "Sagutin ang tanong sa pag-unawa sa ibaba! Ang pagpapatunay na naunawaan mo ang pangungusap ay magbibigay ng dagdag na XP.",
          tip: "Balikan ang nabuong pangungusap upang mahanap ang tamang sagot!",
          speech: "Sagutin ang Tanong. Sagutin ang katanungan tungkol sa iyong pangungusap upang magwagi."
        }
      ]
    },

    "vocab-quest": {
      en: [
        {
          target: "#targetWordDisplay, .target-word-display",
          title: "Target Mystery Word 🔍",
          desc: "Here is your vocabulary case word! Check the word and its phonetic syllables to practice saying it out loud.",
          tip: "Tap 'Read Aloud' at the top to hear the mystery word and sentence spoken.",
          speech: "Target Mystery Word. Here is your vocabulary mystery word and how to pronounce it."
        },
        {
          target: ".evidence-box, #evidenceSentence",
          title: "Inspect the Clues 🕵️",
          desc: "Examine the sentence evidence! Look at the words surrounding the mystery word to find hints about its definition.",
          tip: "Look for synonyms, opposites, or descriptions inside the same sentence!",
          speech: "Inspect the Clues. Read the sentence around the word to discover clues about what it means."
        },
        {
          target: "#choicesContainer, .choices-grid",
          title: "Crack the Definition! 🎯",
          desc: "Select the definition that best fits the sentence clues. Solve all 5 vocabulary cases to rank up as Master Detective!",
          tip: "Substitute each choice into the sentence to see which one makes the most sense.",
          speech: "Crack the Definition! Tap the definition that fits the clues to solve the mystery case."
        }
      ],
      fil: [
        {
          target: "#targetWordDisplay, .target-word-display",
          title: "Mahiwagang Salita 🔍",
          desc: "Narito ang mahiwagang salita! Tingnan ang tamang baybay at mga pantig nito upang masanay sa pagbigkas nang malinaw.",
          tip: "Pindutin ang 'Read Aloud' sa itaas upang marinig ang salita at pangungusap.",
          speech: "Mahiwagang Salita. Narito ang salitang susuriin at ang wastong pagbigkas nito."
        },
        {
          target: ".evidence-box, #evidenceSentence",
          title: "Suriin ang mga Pahiwatig 🕵️",
          desc: "Basahing mabuti ang pangungusap! Maghanap ng mga salitang nagpapahiwatig (context clues) sa tunay na kahulugan ng salita.",
          tip: "Maghanap ng kasingkahulugan, kasalungat, o paliwanag sa mismong pangungusap!",
          speech: "Suriin ang mga Pahiwatig. Gamitin ang mga pahiwatig sa pangungusap upang matuklasan ang kahulugan."
        },
        {
          target: "#choicesContainer, .choices-grid",
          title: "Tukuyin ang Kahulugan! 🎯",
          desc: "Piliin ang pinakaangkop na kahulugan batay sa mga pahiwatig. Lutasin ang 5 kaso upang maging Master Detective!",
          tip: "Subukang ipalit ang bawat pagpipilian sa pangungusap upang makita ang pinakatama.",
          speech: "Tukuyin ang Kahulugan! Piliin ang tamang kahulugan upang malutas ang kaso at makakuha ng XP."
        }
      ]
    },

    "comprehension-trail": {
      en: [
        {
          target: ".passage-card, #passageText",
          title: "Read the Trail Story 📖",
          desc: "Read the trail story passage carefully. You can also tap <strong>Read to Me</strong> to have the passage read aloud to you.",
          tip: "Read the story once for the main idea, then scan back for exact details.",
          speech: "Read the Trail Story. Read the story passage or tap Read to Me to listen to the narrator."
        },
        {
          target: ".question-card, #promptText",
          title: "The Trail Question 🧭",
          desc: "Read the comprehension question! It asks about a key detail, character feeling, or lesson from the story.",
          tip: "Underline or remember the keywords in the question.",
          speech: "The Trail Question. Read the question carefully to find out what clue you need to search for."
        },
        {
          target: "#choicesContainer, .choices-grid",
          title: "Choose Text Evidence 🏔️",
          desc: "Pick the answer supported by direct facts from the text. Be careful of answers that sound plausible but aren't in the passage!",
          tip: "Good readers always double-check the passage before choosing!",
          speech: "Choose Text Evidence. Select the answer that is proven by facts in the story."
        },
        {
          target: ".mountain-stage, #campsTrack",
          title: "Summit the Mountain! 🧗",
          desc: "Each correct answer climbs your hiker higher up the camps. Answer all 5 correctly to reach the sunny mountain summit!",
          tip: "Reach Camp 5 for maximum XP and the Trail Master badge!",
          speech: "Summit the Mountain! Advance your hiker up the trail to reach the summit and celebrate!"
        }
      ],
      fil: [
        {
          target: ".passage-card, #passageText",
          title: "Basahin ang Kuwento sa Bundok 📖",
          desc: "Basahing mabuti ang talata ng kuwento sa bundok. Maaari mo ring pindutin ang <strong>Basahin Para sa Akin</strong> upang marinig ito mula sa tagapagsalaysay.",
          tip: "Basahin muna para sa buong diwa, saka balikan ang mga tiyak na detalye.",
          speech: "Basahin ang Kuwento sa Bundok. Basahin ang talata o pindutin ang Basahin Para sa Akin upang marinig ito."
        },
        {
          target: ".question-card, #promptText",
          title: "Ang Tanong sa Daan 🧭",
          desc: "Basahin ang tanong sa pag-unawa! Nagtatanong ito tungkol sa mahalagang detalye, damdamin ng tauhan, o aral sa kuwento.",
          tip: "Tandaan ang mahahalagang salita sa tanong.",
          speech: "Ang Tanong sa Daan. Basahing mabuti ang tanong upang malaman kung anong patunay ang hahanapin."
        },
        {
          target: "#choicesContainer, .choices-grid",
          title: "Piliin ang Patunay sa Teksto 🏔️",
          desc: "Piliin ang sagot na may direktang patunay sa binasa. Mag-ingat sa mga sagot na tila totoo ngunit wala naman sa talata!",
          tip: "Ang mahuhusay na mambabasa ay laging nagbabalik sa talata bago sumagot!",
          speech: "Piliin ang Patunay sa Teksto. Piliin ang sagot na napatunayan ng mga salita sa kuwento."
        },
        {
          target: ".mountain-stage, #campsTrack",
          title: "Umakyat sa Tuktok ng Bundok! 🧗",
          desc: "Bawat tamang sagot ay magpapaakyat sa iyong manlalakbay sa mga kampo. Sagutin nang tama ang 5 upang maabot ang maningning na tuktok!",
          tip: "Abutin ang Camp 5 upang makuha ang pinakamataas na XP at Trail Master badge!",
          speech: "Umakyat sa Tuktok ng Bundok! Iakyat ang iyong manlalakbay hanggang sa tuktok upang magtagumpay!"
        }
      ]
    },

    "subtraction-sprint": {
      en: [
        {
          target: ".subtraction-prompt-card, #promptMath",
          title: "Sprint Equation 🏃💨",
          desc: "Look at your subtraction equation. Subtraction means taking away an amount or finding the distance between two numbers.",
          tip: "Tap the speaker icon anytime to hear the equation read aloud!",
          speech: "Sprint Equation. Look at the subtraction problem. Subtraction means taking away or finding the difference."
        },
        {
          target: ".number-line-stage, #numberLineWrapper",
          title: "Jump Backward on the Line 📏",
          desc: "Watch the visual number line! It starts at the first number and hops backward. Where you land is your difference!",
          tip: "Counting backward is like taking steps back on a track.",
          speech: "Jump Backward on the Line. Use the number line jumps to count backward to the answer."
        },
        {
          target: "#choicesContainer, .sprint-choices",
          title: "Clear the Hurdle! ⚡",
          desc: "Tap the correct difference button quickly to leap over the hurdle and keep your sprint velocity high!",
          tip: "Fast, accurate answers boost your combo meter!",
          speech: "Clear the Hurdle! Tap the correct answer quickly to jump over the hurdle."
        },
        {
          target: ".stadium-track-container, .track-lanes",
          title: "Race to the Finish Line! 🏁",
          desc: "Watch your runner dash across the stadium lanes. Clear 5 hurdles to sprint through the checkered flag and claim your trophy!",
          tip: "Sprint your way to a personal best time and XP!",
          speech: "Race to the Finish Line! Dash across the track and cross the checkered flag to win!"
        }
      ],
      fil: [
        {
          target: ".subtraction-prompt-card, #promptMath",
          title: "Hamon sa Pagbabawas 🏃💨",
          desc: "Tingnan ang equation ng pagbabawas. Ang subtraction ay pag-aawas ng bilang o paghahanap ng agwat sa pagitan ng dalawang numero.",
          tip: "Pindutin ang speaker icon upang marinig ang tanong!",
          speech: "Hamon sa Pagbabawas. Ang subtraction ay pagbabawas o pag-alam sa agwat ng dalawang bilang."
        },
        {
          target: ".number-line-stage, #numberLineWrapper",
          title: "Tumalon Pabalik sa Number Line 📏",
          desc: "Tingnan ang visual number line! Nagsisimula ito sa unang numero at tumatalon pabalik. Kung saan ito lumapag, iyon ang sagot!",
          tip: "Ang pagbilang pabalik ay parang pag-atras sa linya ng takbuhan.",
          speech: "Tumalon Pabalik sa Number Line. Sundan ang mga talon pabalik upang mahanap ang tamang sagot."
        },
        {
          target: "#choicesContainer, .sprint-choices",
          title: "Talon sa Hurdles! ⚡",
          desc: "Pindutin agad ang tamang sagot upang makatalon sa balakid at mapanatili ang iyong bilis sa takbuhan!",
          tip: "Ang mabilis at wastong sagot ay nagpapataas ng iyong combo streak!",
          speech: "Talon sa Hurdles! Pindutin ang tamang sagot upang makatalon sa balakid nang walang tigil."
        },
        {
          target: ".stadium-track-container, .track-lanes",
          title: "Tumakbo Patungo sa Finish Line! 🏁",
          desc: "Panoorin ang iyong mananakbo sa stadium. Lampasan ang 5 hurdles upang matapos ang karera at makuha ang tropeo!",
          tip: "Magpatuloy sa pagtakbo para sa pinakamataas na puntos at XP!",
          speech: "Tumakbo Patungo sa Finish Line! Tumakbo nang matulin at tawirin ang finish line upang magwagi!"
        }
      ]
    },

    "place-value-builder": {
      en: [
        {
          target: ".builder-prompt-card, #promptMath",
          title: "Place Value Blueprint 🧱",
          desc: "Read the building order! It tells you how many hundreds, tens, and ones you need to combine into a total number.",
          tip: "Tap the speaker button to hear the place value prompt read aloud.",
          speech: "Place Value Blueprint. Read how many hundreds, tens, and ones you need to combine."
        },
        {
          target: ".base10-stage, #base10Wrapper",
          title: "Base-10 Manipulative Blocks 🟩",
          desc: "Inspect the colorful blocks: large flats equal <strong>100</strong>, tall rods equal <strong>10</strong>, and unit cubes equal <strong>1</strong>.",
          tip: "Count the rods by tens (10, 20, 30...) and unit cubes by ones!",
          speech: "Base-10 Blocks. Look at the blocks: flats are 100, rods are 10, and unit cubes are 1."
        },
        {
          target: "#choicesContainer, .builder-choices",
          title: "Select the Total Number 🎯",
          desc: "Add up the values and tap the matching standard number to lock in your building score!",
          tip: "For 3 tens and 4 ones, the number is 34!",
          speech: "Select the Total Number. Tap the matching number to finish your build and score points."
        }
      ],
      fil: [
        {
          target: ".builder-prompt-card, #promptMath",
          title: "Hamon sa Place Value 🧱",
          desc: "Basahin ang building order! Sinasabi nito kung ilang daanan (hundreds), sampuan (tens), at isahan (ones) ang kailangang pagsamahin.",
          tip: "Pindutin ang speaker upang marinig ang tanong sa place value.",
          speech: "Hamon sa Place Value. Basahin kung ilang daanan, sampuan, at isahan ang bubuuin."
        },
        {
          target: ".base10-stage, #base10Wrapper",
          title: "Mga Bloke ng Base-10 🟩",
          desc: "Suriin ang mga bloke: ang malapad na flat ay <strong>100</strong>, ang mataas na rod ay <strong>10</strong>, at ang maliit na cube ay <strong>1</strong>.",
          tip: "Bilangin ang mga rod nang pasampû (10, 20, 30...) at ang mga cube nang paisa-isa!",
          speech: "Mga Bloke ng Base-10. Ang flat ay isang daan, ang rod ay sampu, at ang cube ay isa."
        },
        {
          target: "#choicesContainer, .builder-choices",
          title: "Piliin ang Kabuuang Bilang 🎯",
          desc: "Pagsamahin ang mga halaga at pindutin ang katugmang numero upang mabuo ang tore ng mga bloke!",
          tip: "Halimbawa: 3 sampuan at 4 isahan ay katumbas ng 34!",
          speech: "Piliin ang Kabuuang Bilang. Piliin ang tamang numero upang mabuo ang iyong gusali at makapuntos."
        }
      ]
    },

    "fraction-pizza": {
      en: [
        {
          target: ".fraction-prompt-box, #promptText",
          title: "Customer Pizza Order 🍕",
          desc: "Read the customer's fraction order! The top number (numerator) tells how many slices are taken, and the bottom number (denominator) tells total equal slices.",
          tip: "For 1/4, one slice out of four equal slices is chosen!",
          speech: "Customer Pizza Order. Read the fraction order to see how many slices out of the whole are needed."
        },
        {
          target: ".pizza-stage, #pizzaWrapper",
          title: "Count Equal Slices 🥧",
          desc: "Look at the visual pizza! Count the total equal slices to see how the whole pizza has been divided.",
          tip: "Equal parts are the golden rule of fractions!",
          speech: "Count Equal Slices. Look at the pizza graphic to count the equal parts of the whole."
        },
        {
          target: "#choicesContainer, .pizza-choices",
          title: "Serve the Fraction! 👨‍🍳",
          desc: "Tap the matching fraction choice to bake and serve the exact pizza the customer ordered.",
          tip: "Look for both the matching numerator and denominator!",
          speech: "Serve the Fraction! Tap the matching fraction to bake and serve the customer order."
        },
        {
          target: ".pizza-progress-track, .pizza-slices-meter",
          title: "Complete 5 Chef Orders 🏆",
          desc: "Fulfill all 5 pizza orders to earn your Master Pizza Chef badge and save your numeracy progress.",
          tip: "Each completed order lights up a mini pizza token!",
          speech: "Complete 5 Chef Orders. Finish all 5 customer orders to become a Master Pizza Chef!"
        }
      ],
      fil: [
        {
          target: ".fraction-prompt-box, #promptText",
          title: "Order na Fraction ng Pizza 🍕",
          desc: "Basahin ang order ng customer! Ang itaas na bilang (numerator) ay ang kailangang hiwa, at ang ibaba (denominator) ang kabuuang magkakaparehong hiwa.",
          tip: "Para sa 1/4, isang hiwa mula sa apat na magkakaparehong hiwa ang kailangan!",
          speech: "Order na Fraction ng Pizza. Basahin kung ilang pantay na hiwa mula sa buong pizza ang hinahanap."
        },
        {
          target: ".pizza-stage, #pizzaWrapper",
          title: "Bilangin ang Pantay na Hiwa 🥧",
          desc: "Tingnan ang visual na pizza! Bilangin ang pantay-pantay na hiwa upang makita kung paano nahati ang buong pizza.",
          tip: "Ang magkakasukat na bahagi ang pinakamahalagang batas sa fractions!",
          speech: "Bilangin ang Pantay na Hiwa. Tingnan ang pizza upang mabilang ang magkakaparehong parte."
        },
        {
          target: "#choicesContainer, .pizza-choices",
          title: "Ihain ang Tamang Fraction! 👨‍🍳",
          desc: "Piliin ang tamang fraction upang maihain ang tamang pizza sa naghihintay na mamimili.",
          tip: "Suriin kapwa ang numerator at denominator bago pumili!",
          speech: "Ihain ang Tamang Fraction! Piliin ang fraction na tumutugma sa hinihingi ng customer."
        },
        {
          target: ".pizza-progress-track, .pizza-slices-meter",
          title: "Kumpletuhin ang 5 Order ng Chef 🏆",
          desc: "Tapusin ang lahat ng 5 order ng pizza upang makamit ang iyong Master Pizza Chef badge at magtala ng XP!",
          tip: "Bawat tapos na order ay magpapasindi ng isang mini pizza token!",
          speech: "Kumpletuhin ang 5 Order ng Chef. Tapusin ang lahat ng limang order upang maging Master Chef!"
        }
      ]
    },

    "pronunciation-practice": {
      en: [
        {
          target: ".pronunciation-stage, #word",
          title: "The Target Word 🗣️",
          desc: "Look at the target word on stage! Take a second to read the letters and sound out the word.",
          tip: "Notice the vowels and consonant patterns.",
          speech: "The Target Word. Look at the word on stage and sound it out."
        },
        {
          target: "#listenBtn, .listen-button",
          title: "Listen to the Pronunciation 🎧",
          desc: "Tap <strong>Listen</strong> first! Hear the proper native pronunciation of the word so you know how to say it.",
          tip: "You can tap Listen multiple times to hear it as often as you like.",
          speech: "Listen to the Pronunciation. Tap Listen to hear the correct pronunciation of the word."
        },
        {
          target: "#speakBtn, .speak-button",
          title: "Say It into Your Mic 🎙️",
          desc: "When you are ready, tap <strong>Say It</strong> and pronounce the word clearly into your device microphone!",
          tip: "Speak at normal volume and enunciate clearly to get a high score!",
          speech: "Say It into Your Mic. Tap Say It and speak clearly into your microphone to get instant feedback."
        }
      ],
      fil: [
        {
          target: ".pronunciation-stage, #word",
          title: "Ang Salitang Sasabihin 🗣️",
          desc: "Tingnan ang salita sa entablado! Pag-aralan ang mga letra at pakinggan ang tunog sa iyong isip bago magsalita.",
          tip: "Pansinin ang mga patinig at katinig ng salita.",
          speech: "Ang Salitang Sasabihin. Tingnan ang salita sa entablado at pag-aralan ang tunog nito."
        },
        {
          target: "#listenBtn, .listen-button",
          title: "Pakinggan ang Pagbigkas 🎧",
          desc: "Pindutin muna ang <strong>Listen</strong>! Pakinggan kung paano ito binibigkas nang wasto at malinaw.",
          tip: "Maaari mong pindutin ang Listen nang paulit-ulit hanggang sa maging handa ka.",
          speech: "Pakinggan ang Pagbigkas. Pindutin ang Listen upang marinig ang tamang paraan ng pagsasalita."
        },
        {
          target: "#speakBtn, .speak-button",
          title: "Bigkasin sa Iyong Mikropono 🎙️",
          desc: "Kapag handa ka na, pindutin ang <strong>Say It</strong> at sabihin nang malinaw ang salita sa iyong mikropono!",
          tip: "Magsalita sa normal na lakas at linaw upang makakuha ng mataas na puntos!",
          speech: "Bigkasin sa Iyong Mikropono. Pindutin ang Say It at magsalita nang malinaw upang makapuntos."
        }
      ]
    }
  };

  class TutorialController {
    constructor() {
      this.active = false;
      this.activityId = null;
      this.steps = [];
      this.currentStep = 0;
      this.backdropEl = null;
      this.spotlightEl = null;
      this.popoverEl = null;
      this.currentTargetEl = null;
      this.isSpeaking = false;

      this.boundResize = this.handleResize.bind(this);
      this.boundKeydown = this.handleKeydown.bind(this);
      this.boundLanguageChange = this.handleLanguageChange.bind(this);

      // Listen for global language changes
      if (typeof window.addEventListener === "function") {
        window.addEventListener("numeread:languagechange", this.boundLanguageChange);
      }
    }

    getLang() {
      return window.NumeReadI18n ? window.NumeReadI18n.getLanguage() : "en";
    }

    getStepsForActivity(activityId) {
      const config = TUTORIAL_STEPS[activityId];
      if (!config) return [];
      const lang = this.getLang();
      return config[lang] || config.en || [];
    }

    /**
     * Start the tutorial for the given activity
     */
    start(activityId) {
      this.activityId = activityId;
      this.steps = this.getStepsForActivity(activityId);

      if (!this.steps || !this.steps.length) {
        console.warn(`No tutorial configured for activity: ${activityId}`);
        return false;
      }

      this.stopSpeaking();
      this.currentStep = 0;
      this.active = true;

      this.createDOM();
      window.addEventListener("resize", this.boundResize, { passive: true });
      window.addEventListener("scroll", this.boundResize, { passive: true });
      document.addEventListener("keydown", this.boundKeydown);

      this.renderStep(0);
      return true;
    }

    /**
     * Re-render current step when language changes mid-tutorial
     */
    handleLanguageChange() {
      if (!this.active || !this.activityId) return;
      this.steps = this.getStepsForActivity(this.activityId);
      this.renderStep(this.currentStep);
    }

    /**
     * Build the spotlight, backdrop, and floating popover card DOM
     */
    createDOM() {
      this.cleanupDOM();

      // Click-catcher backdrop
      this.backdropEl = document.createElement("div");
      this.backdropEl.className = "numeread-tutorial-backdrop";
      this.backdropEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(this.backdropEl);

      // Moving rounded square spotlight box
      this.spotlightEl = document.createElement("div");
      this.spotlightEl.className = "numeread-spotlight-box";
      document.body.appendChild(this.spotlightEl);

      // Floating card dialog
      this.popoverEl = document.createElement("div");
      this.popoverEl.className = "numeread-tutorial-popover";
      this.popoverEl.setAttribute("role", "dialog");
      this.popoverEl.setAttribute("aria-modal", "true");
      this.popoverEl.setAttribute("aria-labelledby", "tutorialTitle");
      document.body.appendChild(this.popoverEl);
    }

    /**
     * Render the given step index
     */
    renderStep(index) {
      if (index < 0 || index >= this.steps.length) return;
      this.currentStep = index;
      const step = this.steps[index];
      const total = this.steps.length;
      const isLast = index === total - 1;
      const isFirst = index === 0;

      this.stopSpeaking();

      // Find target element
      const targetEl = this.findTarget(step.target);
      this.currentTargetEl = targetEl;

      // Ensure target element is smoothly scrolled into comfortable view
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }

      // Small delay allows smooth scroll to settle before measuring coordinates
      setTimeout(() => {
        this.updateSpotlightPosition();
        this.updatePopoverContent(step, index, total, isFirst, isLast);
      }, 80);
    }

    findTarget(selectorStr) {
      if (!selectorStr) return document.body;
      const selectors = selectorStr.split(",").map(s => s.trim());
      for (const sel of selectors) {
        const found = document.querySelector(sel);
        if (found && found.offsetParent !== null) {
          return found;
        }
      }
      return document.querySelector(selectors[0]) || document.body;
    }

    /**
     * Position the moving rounded square spotlight over the target
     */
    updateSpotlightPosition() {
      if (!this.spotlightEl) return;
      const target = this.currentTargetEl || document.body;
      const rect = target.getBoundingClientRect();

      const padding = 10;
      const top = Math.max(8, rect.top - padding);
      const left = Math.max(8, rect.left - padding);
      const width = Math.min(window.innerWidth - 16, rect.width + padding * 2);
      const height = Math.min(window.innerHeight - 16, rect.height + padding * 2);

      this.spotlightEl.style.top = `${top}px`;
      this.spotlightEl.style.left = `${left}px`;
      this.spotlightEl.style.width = `${width}px`;
      this.spotlightEl.style.height = `${height}px`;

      const computed = window.getComputedStyle(target);
      const targetRadius = parseInt(computed.borderRadius, 10) || 16;
      this.spotlightEl.style.borderRadius = `${Math.min(24, Math.max(14, targetRadius + 4))}px`;

      this.positionPopover(rect);
    }

    /**
     * Position the popover card smartly above or below the highlighted element
     */
    positionPopover(targetRect) {
      if (!this.popoverEl) return;

      const popoverWidth = Math.min(390, window.innerWidth - 32);
      const popoverHeight = this.popoverEl.offsetHeight || 250;
      const margin = 16;

      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;

      let top = 0;
      let placeBelow = true;

      if (spaceBelow >= popoverHeight + margin) {
        top = targetRect.bottom + 14;
        placeBelow = true;
      } else if (spaceAbove >= popoverHeight + margin) {
        top = targetRect.top - popoverHeight - 14;
        placeBelow = false;
      } else {
        top = Math.max(margin, window.innerHeight - popoverHeight - margin);
        placeBelow = true;
      }

      let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
      left = Math.max(margin, Math.min(window.innerWidth - popoverWidth - margin, left));

      this.popoverEl.style.top = `${top}px`;
      this.popoverEl.style.left = `${left}px`;
      this.popoverEl.classList.add("visible");

      let arrow = this.popoverEl.querySelector(".numeread-tutorial-arrow");
      if (!arrow) {
        arrow = document.createElement("div");
        arrow.className = "numeread-tutorial-arrow";
        this.popoverEl.appendChild(arrow);
      }

      arrow.className = `numeread-tutorial-arrow ${placeBelow ? "arrow-top" : "arrow-bottom"}`;
      const arrowLeft = Math.max(20, Math.min(popoverWidth - 28, (targetRect.left + targetRect.width / 2) - left - 7));
      arrow.style.left = `${arrowLeft}px`;
    }

    /**
     * Update the HTML content and button states of the popover card using i18n
     */
    updatePopoverContent(step, index, total, isFirst, isLast) {
      if (!this.popoverEl) return;

      const t = (key, params) => window.NumeReadI18n ? window.NumeReadI18n.t(key, params) : key;
      const stepBadgeText = t("stepOf", { current: index + 1, total });

      const dotsHtml = this.steps.map((_, i) =>
        `<span class="tutorial-dot ${i === index ? "active" : ""}" data-step="${i}" title="${t("stepOf", { current: i + 1, total })}"></span>`
      ).join("");

      this.popoverEl.innerHTML = `
        <div class="numeread-tutorial-arrow arrow-top"></div>
        <div class="tutorial-popover-header">
          <span class="tutorial-step-badge">
            <i class="fas fa-sparkles"></i> ${stepBadgeText}
          </span>
          <button type="button" class="tutorial-close-btn" id="tutorialCloseBtn" aria-label="Close tutorial">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <h3 class="tutorial-popover-title" id="tutorialTitle">${step.title}</h3>
        <p class="tutorial-popover-desc">${step.desc}</p>

        ${step.tip ? `
          <div class="tutorial-tip-box">
            <i class="fas fa-lightbulb"></i>
            <div><strong>${t("tip")}:</strong> ${step.tip}</div>
          </div>
        ` : ""}

        <button type="button" class="tutorial-listen-btn" id="tutorialSpeakBtn" aria-label="Listen to step explanation">
          <i class="fas fa-volume-high"></i> <span>${t("listenToStep")}</span>
        </button>

        <div class="tutorial-popover-footer">
          <div class="tutorial-dots">${dotsHtml}</div>
          <div class="tutorial-actions">
            ${!isLast ? `<button type="button" class="tutorial-btn-skip" id="tutorialSkipBtn">${t("skip")}</button>` : ""}
            <button type="button" class="tutorial-btn-secondary" id="tutorialPrevBtn" ${isFirst ? "disabled" : ""}>
              <i class="fas fa-arrow-left"></i> ${t("back")}
            </button>
            <button type="button" class="tutorial-btn-primary" id="tutorialNextBtn">
              ${isLast ? t("letsPlay") : `${t("next")} <i class="fas fa-arrow-right"></i>`}
            </button>
          </div>
        </div>
      `;

      // Wire buttons
      this.popoverEl.querySelector("#tutorialCloseBtn").addEventListener("click", () => this.end());
      const skipBtn = this.popoverEl.querySelector("#tutorialSkipBtn");
      if (skipBtn) skipBtn.addEventListener("click", () => this.end());
      this.popoverEl.querySelector("#tutorialPrevBtn").addEventListener("click", () => this.prev());
      this.popoverEl.querySelector("#tutorialNextBtn").addEventListener("click", () => this.next());

      // Lively Speech button
      const speakBtn = this.popoverEl.querySelector("#tutorialSpeakBtn");
      speakBtn.addEventListener("click", () => this.toggleSpeech(step));

      // Dots navigation
      this.popoverEl.querySelectorAll(".tutorial-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
          const stepIdx = parseInt(e.target.dataset.step, 10);
          if (!isNaN(stepIdx)) this.renderStep(stepIdx);
        });
      });

      requestAnimationFrame(() => {
        if (this.currentTargetEl) {
          this.positionPopover(this.currentTargetEl.getBoundingClientRect());
        }
      });
    }

    next() {
      if (this.currentStep < this.steps.length - 1) {
        this.renderStep(this.currentStep + 1);
      } else {
        this.end();
      }
    }

    prev() {
      if (this.currentStep > 0) {
        this.renderStep(this.currentStep - 1);
      }
    }

    end() {
      this.stopSpeaking();
      this.active = false;
      this.cleanupDOM();

      window.removeEventListener("resize", this.boundResize);
      window.removeEventListener("scroll", this.boundResize);
      document.removeEventListener("keydown", this.boundKeydown);

      if (this.activityId) {
        localStorage.setItem(`numeread_tutorial_${this.activityId}`, "completed");
      }
    }

    cleanupDOM() {
      if (this.backdropEl) {
        this.backdropEl.remove();
        this.backdropEl = null;
      }
      if (this.spotlightEl) {
        this.spotlightEl.remove();
        this.spotlightEl = null;
      }
      if (this.popoverEl) {
        this.popoverEl.remove();
        this.popoverEl = null;
      }
    }

    toggleSpeech(step) {
      if (this.isSpeaking) {
        this.stopSpeaking();
      } else {
        const text = step.speech || `${step.title}. ${step.desc.replace(/<[^>]+>/g, " ")}`;
        this.speak(text);
      }
    }

    /**
     * Lively, warm speech narration
     */
    speak(text) {
      this.stopSpeaking();
      const speakBtn = this.popoverEl?.querySelector("#tutorialSpeakBtn");
      const t = (key) => window.NumeReadI18n ? window.NumeReadI18n.t(key) : key;

      if (speakBtn) {
        speakBtn.classList.add("speaking");
        speakBtn.innerHTML = `<i class="fas fa-volume-high"></i> <span>${t("speaking")}</span>`;
      }
      this.isSpeaking = true;

      const onEnd = () => {
        this.isSpeaking = false;
        if (speakBtn) {
          speakBtn.classList.remove("speaking");
          speakBtn.innerHTML = `<i class="fas fa-volume-high"></i> <span>${t("listenToStep")}</span>`;
        }
      };

      if (window.NumeReadI18n && typeof window.NumeReadI18n.speak === "function") {
        window.NumeReadI18n.speak(text, onEnd);
      } else if (window.NumeReadSound && typeof window.NumeReadSound.speak === "function") {
        window.NumeReadSound.speak(text, onEnd);
      } else if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.03;
        utter.pitch = 1.18;
        utter.onend = onEnd;
        utter.onerror = onEnd;
        window.speechSynthesis.speak(utter);
      } else {
        onEnd();
      }
    }

    stopSpeaking() {
      this.isSpeaking = false;
      const t = (key) => window.NumeReadI18n ? window.NumeReadI18n.t(key) : key;

      if (window.NumeReadI18n && typeof window.NumeReadI18n.stopSpeaking === "function") {
        window.NumeReadI18n.stopSpeaking();
      } else if (window.NumeReadSound && typeof window.NumeReadSound.stopSpeaking === "function") {
        window.NumeReadSound.stopSpeaking();
      } else if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const speakBtn = this.popoverEl?.querySelector("#tutorialSpeakBtn");
      if (speakBtn) {
        speakBtn.classList.remove("speaking");
        speakBtn.innerHTML = `<i class="fas fa-volume-high"></i> <span>${t("listenToStep")}</span>`;
      }
    }

    handleResize() {
      if (!this.active) return;
      this.updateSpotlightPosition();
    }

    handleKeydown(e) {
      if (!this.active) return;
      if (e.key === "Escape") {
        this.end();
      } else if (e.key === "ArrowRight") {
        this.next();
      } else if (e.key === "ArrowLeft") {
        this.prev();
      }
    }

    isActive() {
      return this.active;
    }

    /**
     * Install a persistent "How to Play" button in the game's top stats bar
     */
    installButton(activityId, containerSelector = ".stats-pills") {
      const container = document.querySelector(containerSelector);
      if (!container || container.querySelector("[data-game-tutorial]")) return;

      const t = (key) => window.NumeReadI18n ? window.NumeReadI18n.t(key) : "How to Play";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.gameTutorial = "";
      btn.className = "pill tutorial-pill";
      btn.setAttribute("aria-label", "Show tutorial instructions on how to play this game");
      btn.innerHTML = `<i class="fas fa-circle-question"></i> ${t("howToPlay")}`;
      btn.addEventListener("click", () => {
        this.start(activityId);
      });

      container.appendChild(btn);

      // Check if student has never seen this tutorial before
      const hasSeen = localStorage.getItem(`numeread_tutorial_${activityId}`);
      if (!hasSeen) {
        setTimeout(() => {
          if (!this.active) {
            this.start(activityId);
          }
        }, 650);
      }
    }
  }

  // Export singleton to window
  window.NumeReadTutorial = new TutorialController();
  window.NumeReadTutorialSteps = TUTORIAL_STEPS;
})();
