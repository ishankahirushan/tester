package com.axsynthegroup.crm.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates GPA on a 4.0 scale from percentage.
 * Pass mark = 40
 */
@Component
public class GpaCalculator {

    public static final BigDecimal PASS_MARK = BigDecimal.valueOf(40);

    /**
     * Convert raw percentage (0-100) to 4.0 GPA scale.
     */
    public BigDecimal calculateGpa(BigDecimal percentage) {
        if (percentage == null) return BigDecimal.ZERO;

        double pct = percentage.doubleValue();

        if (pct >= 90) return BigDecimal.valueOf(4.0);
        if (pct >= 80) return BigDecimal.valueOf(3.7);
        if (pct >= 75) return BigDecimal.valueOf(3.3);
        if (pct >= 70) return BigDecimal.valueOf(3.0);
        if (pct >= 65) return BigDecimal.valueOf(2.7);
        if (pct >= 60) return BigDecimal.valueOf(2.3);
        if (pct >= 55) return BigDecimal.valueOf(2.0);
        if (pct >= 50) return BigDecimal.valueOf(1.7);
        if (pct >= 45) return BigDecimal.valueOf(1.3);
        if (pct >= 40) return BigDecimal.valueOf(1.0);
        return BigDecimal.ZERO; // Below pass mark
    }

    /**
     * Calculate percentage from marks obtained and max marks.
     */
    public BigDecimal calculatePercentage(BigDecimal marksObtained, BigDecimal maxMarks) {
        if (maxMarks == null || maxMarks.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return marksObtained.divide(maxMarks, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate weighted average GPA from multiple subject GPAs.
     */
    public BigDecimal calculateAverageGpa(java.util.List<BigDecimal> gpas) {
        if (gpas == null || gpas.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = gpas.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(gpas.size()), 2, RoundingMode.HALF_UP);
    }

    public boolean isPassing(BigDecimal marksObtained) {
        return marksObtained != null && marksObtained.compareTo(PASS_MARK) >= 0;
    }
}
