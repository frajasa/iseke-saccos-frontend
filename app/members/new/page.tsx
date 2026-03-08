"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_MEMBER, GET_MEMBERS, GET_BRANCHES } from "@/lib/graphql/queries";
import { CreateMemberInput, Gender, MaritalStatus, Branch } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Camera, X, Fingerprint, Upload } from "lucide-react";
import Link from "next/link";
import SignaturePad from "@/components/ui/SignaturePad";

export default function NewMemberPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fingerprintInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateMemberInput>({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    nationalId: "",
    phoneNumber: "",
    email: "",
    address: "",
    occupation: "",
    employer: "",
    monthlyIncome: undefined,
    maritalStatus: undefined,
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
    branchId: undefined,
    photo: undefined,
    signature: undefined,
    fingerprint: undefined,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fingerprintPreview, setFingerprintPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: branchesData } = useQuery(GET_BRANCHES, {
    variables: { status: "ACTIVE" },
  });

  const branches: Branch[] = branchesData?.branches || [];

  const [createMember, { loading }] = useMutation(CREATE_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS }],
    onCompleted: (data) => {
      router.push(`/members/${data.createMember.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.nextOfKinName.trim()) {
      newErrors.nextOfKinName = "Next of kin name is required";
    }
    if (!formData.nextOfKinPhone.trim()) {
      newErrors.nextOfKinPhone = "Next of kin phone is required";
    }
    if (!formData.nextOfKinRelationship.trim()) {
      newErrors.nextOfKinRelationship = "Next of kin relationship is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const input: CreateMemberInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      nextOfKinName: formData.nextOfKinName,
      nextOfKinPhone: formData.nextOfKinPhone,
      nextOfKinRelationship: formData.nextOfKinRelationship,
    };

    if (formData.middleName) input.middleName = formData.middleName;
    if (formData.nationalId) input.nationalId = formData.nationalId;
    if (formData.email) input.email = formData.email;
    if (formData.occupation) input.occupation = formData.occupation;
    if (formData.employer) input.employer = formData.employer;
    if (formData.monthlyIncome != null) input.monthlyIncome = formData.monthlyIncome;
    if (formData.maritalStatus) input.maritalStatus = formData.maritalStatus;
    if (formData.branchId) input.branchId = formData.branchId;
    if (formData.photo) input.photoPath = formData.photo;
    if (formData.signature) input.signaturePath = formData.signature;
    if (formData.fingerprint) input.fingerprintPath = formData.fingerprint;

    await createMember({
      variables: { input },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monthlyIncome" ? (value ? parseFloat(value) : undefined) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Please select an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Image must be less than 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setFormData((prev) => ({ ...prev, photo: base64 }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: undefined }));
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleFingerprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, fingerprint: "Please select an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, fingerprint: "File must be less than 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFingerprintPreview(base64);
      setFormData((prev) => ({ ...prev, fingerprint: base64 }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.fingerprint;
        return newErrors;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFingerprint = () => {
    setFingerprintPreview(null);
    setFormData((prev) => ({ ...prev, fingerprint: undefined }));
    if (fingerprintInputRef.current) fingerprintInputRef.current.value = "";
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm";
  const inputErrorClass = "w-full px-4 py-2.5 rounded-lg border border-destructive bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive transition-all text-sm";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Add New Member</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register a new SACCOS member
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo & Identity Section */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Photo & Identity
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Passport Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-36 h-36 rounded-xl border-2 border-dashed border-input bg-muted/30 flex items-center justify-center overflow-hidden group hover:border-primary/30 transition-colors">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Member photo"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-3">
                    <Camera className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Passport Photo</p>
                  </div>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </button>
              {errors.photo && (
                <p className="text-xs text-destructive">{errors.photo}</p>
              )}
            </div>

            {/* Personal Info Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? inputErrorClass : inputClass}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-destructive text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? inputErrorClass : inputClass}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-destructive text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? inputErrorClass : inputClass}
                />
                {errors.dateOfBirth && (
                  <p className="text-destructive text-xs mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Gender <span className="text-destructive">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value={MaritalStatus.SINGLE}>Single</option>
                  <option value={MaritalStatus.MARRIED}>Married</option>
                  <option value={MaritalStatus.DIVORCED}>Divorced</option>
                  <option value={MaritalStatus.WIDOWED}>Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  National ID
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., 19900101-12345-12345-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors.phoneNumber ? inputErrorClass : inputClass}
                placeholder="+255 XXX XXX XXX"
              />
              {errors.phoneNumber && (
                <p className="text-destructive text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Address <span className="text-destructive">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className={errors.address ? inputErrorClass : inputClass}
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-destructive text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Employment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Teacher, Farmer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Employer
              </label>
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                className={inputClass}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Monthly Income (TZS)
              </label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome || ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Next of Kin Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Next of Kin Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nextOfKinName"
                value={formData.nextOfKinName}
                onChange={handleChange}
                className={errors.nextOfKinName ? inputErrorClass : inputClass}
                placeholder="Jane Doe"
              />
              {errors.nextOfKinName && (
                <p className="text-destructive text-xs mt-1">{errors.nextOfKinName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                name="nextOfKinPhone"
                value={formData.nextOfKinPhone}
                onChange={handleChange}
                className={errors.nextOfKinPhone ? inputErrorClass : inputClass}
                placeholder="+255 XXX XXX XXX"
              />
              {errors.nextOfKinPhone && (
                <p className="text-destructive text-xs mt-1">{errors.nextOfKinPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Relationship <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nextOfKinRelationship"
                value={formData.nextOfKinRelationship}
                onChange={handleChange}
                className={errors.nextOfKinRelationship ? inputErrorClass : inputClass}
                placeholder="e.g., Spouse, Sibling"
              />
              {errors.nextOfKinRelationship && (
                <p className="text-destructive text-xs mt-1">
                  {errors.nextOfKinRelationship}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Branch Selection */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Branch Assignment
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Branch
            </label>
            <select
              name="branchId"
              value={formData.branchId || ""}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Branch (Optional)</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName} - {branch.branchCode}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs mt-1.5">
              Leave empty to use your current branch
            </p>
          </div>
        </div>

        {/* Signature & Fingerprint */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Signature & Biometrics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Pad */}
            <div>
              <SignaturePad
                value={formData.signature}
                onChange={(dataUrl) =>
                  setFormData((prev) => ({ ...prev, signature: dataUrl || undefined }))
                }
                label="Member Signature"
                width={380}
                height={140}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Draw the member&apos;s signature using mouse or touch
              </p>
            </div>

            {/* Fingerprint */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fingerprint
              </label>
              <div className="border-2 border-dashed border-input rounded-lg bg-muted/30 hover:border-primary/30 transition-colors">
                {fingerprintPreview ? (
                  <div className="relative p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-background flex-shrink-0">
                      <img
                        src={fingerprintPreview}
                        alt="Fingerprint"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Fingerprint captured</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Image uploaded successfully</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fingerprintInputRef.current?.click()}
                          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={removeFingerprint}
                          className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-6 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fingerprintInputRef.current?.click()}
                  >
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Fingerprint className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-0.5">
                      Capture Fingerprint
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Upload a fingerprint scan image or use a biometric device
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fingerprintInputRef}
                type="file"
                accept="image/*"
                onChange={handleFingerprintUpload}
                className="hidden"
              />
              {errors.fingerprint && (
                <p className="text-xs text-destructive mt-1">{errors.fingerprint}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Member
              </>
            )}
          </button>
          <Link
            href="/members"
            className="inline-flex items-center justify-center px-6 py-2.5 text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
