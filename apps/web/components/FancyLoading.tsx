"use client";

import { Card } from "./ui/card";
import { User, Phone, Ruler, Calendar, Info, AlertCircle } from "lucide-react";
import Image from "next/image";

export function FancyLoading() {
  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-2 border-stone-200 shadow-xl transition-all duration-300">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="h-5 w-24 bg-blue-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-4 w-32 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 100}ms` }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-600 rounded-lg flex items-center justify-center animate-pulse">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-4 w-40 bg-slate-300 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-500 rounded-lg flex items-center justify-center animate-pulse">
                <Ruler className="w-4 h-4 text-white" />
              </div>
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-4 w-24 bg-slate-300 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-stone-200"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center animate-pulse">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="h-5 w-40 bg-rose-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-rose-100 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-rose-100 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center animate-pulse">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="h-5 w-44 bg-amber-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-amber-100 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="h-px bg-stone-200"></div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="h-5 w-48 bg-indigo-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
                <div className="h-4 w-32 bg-indigo-100 rounded animate-pulse mb-2" style={{ animationDelay: `${i * 100}ms` }}></div>
                <div className="h-3 w-24 bg-indigo-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-stone-200"></div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-sm">💊</span>
            </div>
            <div className="h-5 w-32 bg-blue-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <div className="h-4 w-28 bg-blue-100 rounded animate-pulse mb-2" style={{ animationDelay: `${i * 100}ms` }}></div>
                <div className="h-3 w-20 bg-blue-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FancyLoadingHeader() {
  return (
    <Card className="p-3 md:p-4 bg-white/80 backdrop-blur-md border-2 border-stone-200 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-20 -z-10 animate-pulse"></div>

      <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-40 bg-slate-300 rounded animate-pulse"></div>
              <div className="w-4 h-4 bg-blue-300 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="w-full md:w-auto md:text-right space-y-2">
          <div className="h-9 w-56 bg-emerald-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mx-auto md:mx-0"></div>
          <div className="h-8 w-full bg-stone-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
}

export function LogoLoading() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center animate-bounce overflow-hidden">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
              <Image
                src="/meditrack-logo.png"
                alt="MediTrack"
                width={200}
                height={200}
                priority
                className="h-[90%] w-[90%] object-contain rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}

