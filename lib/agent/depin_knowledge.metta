; MeTTa Knowledge Base for DePIN Oracle
; This defines the reasoning patterns and domain knowledge for DePIN analysis

; ========================================
; TYPE DEFINITIONS
; ========================================

(: DeviceType Type)
(: Helium DeviceType)
(: Filecoin DeviceType)
(: Render DeviceType)

(: RiskLevel Type)
(: Low RiskLevel)
(: Medium RiskLevel)
(: High RiskLevel)

(: Recommendation Type)
(: BUY Recommendation)
(: HOLD Recommendation)
(: SELL Recommendation)

; ========================================
; DEVICE CHARACTERISTICS
; ========================================

; Average hardware costs
(= (hardware-cost Helium) 400)
(= (hardware-cost Filecoin) 2000)
(= (hardware-cost Render) 1500)

; Minimum witness threshold for good performance
(= (min-witnesses Helium) 15)
(= (min-transmit-scale Helium) 0.70)

; ========================================
; RISK ASSESSMENT RULES
; ========================================

; Device offline = high risk
(= (assess-online-risk Offline) 3)
(= (assess-online-risk Online) 0)

; Transmit scale risk (Helium specific)
(= (assess-scale-risk $scale)
   (if (< $scale 0.5) 2
   (if (< $scale 0.7) 1
   0)))

; Witness count risk
(= (assess-witness-risk $count)
   (if (< $count 10) 1
   (if (> $count 20) -1
   0)))

; Calculate total risk score
(= (calculate-risk $online $scale $witnesses)
   (let* (
     ($risk-base 5)
     ($online-risk (assess-online-risk $online))
     ($scale-risk (assess-scale-risk $scale))
     ($witness-risk (assess-witness-risk $witnesses))
     ($total (+ $risk-base $online-risk $scale-risk $witness-risk))
   )
   (max 0 (min 10 $total))))

; ========================================
; RECOMMENDATION LOGIC
; ========================================

; Determine recommendation based on risk and ROI
(= (get-recommendation $risk-score $roi-months)
   (if (> $risk-score 7) SELL
   (if (and (< $risk-score 3) (< $roi-months 12)) BUY
   HOLD)))

; ========================================
; PREDICTION MODELS
; ========================================

; Calculate 90-day prediction from 30-day average
(= (predict-90-day $monthly-earnings $confidence-level)
   (let* (
     ($daily-avg (/ $monthly-earnings 30))
     ($base-90-day (* $daily-avg 90))
   )
   (case $confidence-level
     (Conservative (* $base-90-day 0.8))
     (Expected $base-90-day)
     (Optimistic (* $base-90-day 1.2)))))

; ========================================
; LEARNING PATTERNS
; ========================================

; Store successful analysis patterns
(= (learn-from-analysis $device-type $location $earnings $risk)
   (if (< $risk 4)
     (add-to-knowledge (GoodLocation $device-type $location $earnings))
     (add-to-knowledge (HighRiskLocation $device-type $location $risk))))

; Network health indicators
(= (network-health-factor Helium 2024) 0.95)
(= (network-health-factor Filecoin 2024) 0.88)

; ========================================
; COMPARATIVE ANALYSIS
; ========================================

; Compare two devices
(= (compare-devices $device1 $device2)
   (let* (
     ($earnings1 (get-earnings $device1))
     ($earnings2 (get-earnings $device2))
     ($risk1 (get-risk $device1))
     ($risk2 (get-risk $device2))
   )
   (if (and (> $earnings1 $earnings2) (< $risk1 $risk2))
     (Better $device1)
     (Better $device2))))

; ========================================
; MARKET CONDITIONS
; ========================================

; Token volatility factors
(= (volatility-factor HNT) 0.15)  ; 15% monthly volatility
(= (volatility-factor FIL) 0.12)
(= (volatility-factor RNDR) 0.18)

; ========================================
; QUERY PATTERNS
; ========================================

; Natural language intent patterns
(= (intent "analyze") analyze_device)
(= (intent "check") analyze_device)
(= (intent "evaluate") analyze_device)
(= (intent "compare") compare_devices)
(= (intent "portfolio") show_portfolio)
(= (intent "recommend") get_recommendation)
