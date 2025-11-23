import { builder } from "@medical-platform/core";
import "./types/patient";
import "./types/exam";
import "./types/anthropometric";
import "./types/allergy";
import "./types/condition";
import "./types/medicationPlan";
import "./types/diagnosis";
import "./types/consultation";
import "./types/surgery";
import "./types/vaccine";
import "./types/shareLink";
import "./types/user";

// Build and export the schema
export const schema = builder.toSchema();

