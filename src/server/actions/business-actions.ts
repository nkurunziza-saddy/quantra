"use server";
import type { InsertBusiness } from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import {
  getAll as getAllBusinessesRepo,
  getById as getBusinessByIdRepo,
  create as createBusinessRepo,
  update as updateBusinessRepo,
  remove as removeBusinessRepo,
  createMany as createManyBusinessesRepo,
} from "../repos/business-repo";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { revalidatePath } from "next/cache";

export const getBusinesses = createProtectedAction(
  Permission.BUSINESS_VIEW,
  async () => {
    const businesses = await getAllBusinessesRepo();
    if (businesses.error) {
      return { data: null, error: businesses.error };
    }
    return { data: businesses.data, error: null };
  }
);

export const getBusinessById = createProtectedAction(
  Permission.BUSINESS_VIEW,
  async (user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const business = await getBusinessByIdRepo(businessId);
    if (business.error) {
      return { data: null, error: business.error };
    }
    return { data: business.data, error: null };
  }
);

export const createBusiness = async (
  businessData: Omit<InsertBusiness, "id">
) => {
  const session = await getCurrentSession();
  if (!session) {
    return { data: null, error: ErrorCode.UNAUTHORIZED };
  }
  if (!businessData.name?.trim()) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }
  const res = await createBusinessRepo(
    session.user.id,
    businessData as InsertBusiness
  );
  if (res.error) {
    return { data: null, error: res.error };
  }
  revalidatePath("/", "layout");
  return { data: res.data, error: null };
};

export const updateBusiness = createProtectedAction(
  Permission.BUSINESS_UPDATE,
  async (
    user,
    {
      businessId,
      updates,
    }: {
      businessId: string;
      updates: Partial<Omit<InsertBusiness, "id">>;
    }
  ) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const updatedBusiness = await updateBusinessRepo(
      businessId,
      user.id,
      updates
    );
    if (updatedBusiness.error) {
      return { data: null, error: updatedBusiness.error };
    }
    revalidatePath("/", "layout");
    return { data: updatedBusiness.data, error: null };
  }
);

export const deleteBusiness = createProtectedAction(
  Permission.BUSINESS_DELETE,
  async (user, businessId: string) => {
    if (!businessId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const res = await removeBusinessRepo(businessId, user.id);
    if (res.error) {
      return { data: null, error: res.error };
    }
    revalidatePath("/", "layout");
    return { data: { success: true }, error: null };
  }
);

export const createManyBusinesses = createProtectedAction(
  Permission.BUSINESS_CREATE,
  async (user, businessesData: Omit<InsertBusiness, "id">[]) => {
    if (!businessesData?.length) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const businesses: InsertBusiness[] = businessesData as InsertBusiness[];
    const createdBusinesses = await createManyBusinessesRepo(businesses);
    if (createdBusinesses.error) {
      return { data: null, error: createdBusinesses.error };
    }
    revalidatePath("/", "layout");
    return { data: createdBusinesses.data, error: null };
  }
);
