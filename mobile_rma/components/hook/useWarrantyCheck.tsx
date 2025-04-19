import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import { userRequest } from "@/utils/requestMethods";

interface ProductData {
    id: number;
    serial_no: string;
    model_no: string;
    billing_date: string;
    createdAt: string;
}

interface WarrantyDetails {
    warrantyStatus: string;
    warrantyLeft: string;
}

/**
 * Calculates warranty details with a strict 2-year warranty period
 * @param productData Product information containing dates
 * @returns Warranty status and remaining time
 */
const calculateWarrantyDetails = (productData: ProductData): WarrantyDetails => {
    // Use billing date as the warranty start date, fallback to creation date if not available
    const startDate = new Date(productData.billing_date || productData.createdAt);
    const currentDate = new Date();
    
    // Calculate the warranty end date (exactly 2 years from start date)
    const warrantyEndDate = new Date(startDate);
    warrantyEndDate.setFullYear(startDate.getFullYear() + 2);
    
    // Calculate the total time elapsed since the start date
    const totalElapsedTime = currentDate.getTime() - startDate.getTime();
    const totalElapsedDays = Math.ceil(totalElapsedTime / (1000 * 60 * 60 * 24));
    
    // Two years in days (accounting for leap years)
    const twoYearsInDays = 730; // 365 * 2
    
    // If more than 2 years have passed, warranty has expired
    if (totalElapsedDays >= twoYearsInDays) {
        return {
            warrantyStatus: "Out of Warranty",
            warrantyLeft: "Warranty Expired"
        };
    }
    
    // Calculate remaining warranty days
    const remainingDays = twoYearsInDays - totalElapsedDays;
    
    // Format the remaining time in a user-friendly way
    let warrantyLeft = "";
    if (remainingDays > 365) {
        const years = Math.floor(remainingDays / 365);
        const days = remainingDays % 365;
        warrantyLeft = `${years} year${years !== 1 ? 's' : ''}`;
        if (days > 0) {
            warrantyLeft += ` and ${days} day${days !== 1 ? 's' : ''}`;
        }
    } else {
        warrantyLeft = `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
    
    return {
        warrantyStatus: "In Warranty",
        warrantyLeft: warrantyLeft.trim()
    };
};

/**
 * Custom hook to handle warranty checking functionality
 * @param serialNumber Product serial number to check
 * @returns Object containing warranty information and loading state
 */
export const useWarrantyCheck = (serialNumber: string) => {
    const token = useSelector((state: any) => state?.user?.accessToken);

    const { data: warrantyResult, isLoading, error } = useQuery(
        ["check-warranty-status", serialNumber],
        () => userRequest({
            url: `/product/get-product-by-sl/${serialNumber}/`,
            method: "get",
            headers: { Authorization: `Bearer ${token}` }
        }),
        {
            enabled: !!serialNumber && !!token,
            select: (response) => {
                if (response?.data?.[0]) {
                    const productData = response.data[0];
                    const warrantyDetails = calculateWarrantyDetails(productData);
                    
                    return {
                        ...productData,
                        ...warrantyDetails
                    };
                }
                return null;
            }
        }
    );

    return {
        warrantyData: warrantyResult,
        isLoading,
        error
    };
};