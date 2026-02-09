import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { BookOpen, AlertTriangle, ArrowRight, Shuffle, Activity, UserCheck } from 'lucide-react';

export const ManualReference: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 sm:p-8 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-teal-700" />
              The Ashton Manual Guide
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl text-sm leading-relaxed">
              Key principles from <em>Benzodiazepines: How They Work and How to Withdraw</em> by Prof. C. Heather Ashton (2002).
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-full">
              <CardHeader className="bg-indigo-50 border-b-indigo-100 border-b">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                      <Shuffle className="w-4 h-4" />
                      Stage 1: The Crossover
                  </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  <p>
                      <strong>Why switch to Diazepam?</strong><br/>
                      Short-acting benzodiazepines (Xanax, Ativan) cause "inter-dose withdrawal," where blood levels drop rapidly between doses. Diazepam has a very long half-life (up to 200 hours), providing a smooth, stable blood level that acts as a "cushion" during withdrawal.
                  </p>
                  <p>
                      <strong>How to do it:</strong><br/>
                      Switching should be gradual. Replace one dose at a time (e.g., the night dose) with an equivalent dose of Diazepam. Do this every week until fully switched.
                  </p>
              </CardContent>
          </Card>

          <Card className="h-full">
              <CardHeader className="bg-teal-50 border-b-teal-100 border-b">
                  <h3 className="font-bold text-teal-900 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Stage 2: Slow Tapering
                  </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  <p>
                      <strong>The Golden Rule:</strong><br/>
                      "There is no need to hurry." The rate of tapering should be individually tailored.
                  </p>
                  <p>
                      <strong>Typical Rate:</strong><br/>
                      Reduce Diazepam dosage by 1mg - 2mg every 1-2 weeks.
                      <br/><br/>
                      - Above 40mg: Reduce by 2-5mg/week.<br/>
                      - 20mg - 40mg: Reduce by 2mg/week.<br/>
                      - Below 20mg: Reduce by 1mg/week.<br/>
                      - Below 10mg: Reduce by 0.5mg/week.
                  </p>
              </CardContent>
          </Card>
      </div>

      <Card>
          <CardHeader>
              <h3 className="font-bold text-slate-900">Chapter 3: Withdrawal Symptoms</h3>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Psychological</h4>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                          <li>Excitability (jumpiness, restlessness)</li>
                          <li>Insomnia & Nightmares</li>
                          <li>Anxiety, Panic Attacks</li>
                          <li><strong>Depersonalization</strong> (feeling detached)</li>
                          <li><strong>Derealization</strong> (surroundings feel unreal)</li>
                      </ul>
                  </div>
                  <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Sensory</h4>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                          <li><strong>Hypersensitivity</strong> to light, sound, taste</li>
                          <li><strong>Tinnitus</strong> (ringing in ears)</li>
                          <li>Blurred vision</li>
                          <li>Muscle twitching / Fasciculations</li>
                          <li>"Jelly legs"</li>
                      </ul>
                  </div>
                  <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Physical</h4>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                          <li>Headache (tight band around head)</li>
                          <li>Palpitations</li>
                          <li>Sweating, Tremors</li>
                          <li>Nausea / IBS symptoms</li>
                          <li>Metallic taste in mouth</li>
                      </ul>
                  </div>
              </div>
          </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
          <div className="p-4 bg-white rounded-full text-amber-500 shadow-sm shrink-0">
              <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
              <h3 className="font-bold text-amber-900 text-lg">The Importance of Control</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                  Professor Ashton emphasizes that the patient must be in control of their own taper. The doctor provides the prescription and medical supervision, but the patient decides when they are ready for the next cut.
              </p>
              <p className="text-sm font-bold text-amber-800">
                  "Withdrawal is not a race."
              </p>
          </div>
      </div>
      
      <div className="flex justify-center pt-4">
          <a 
            href="https://www.benzo.org.uk/manual/" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline"
          >
              Read the full manual online <ArrowRight className="w-4 h-4" />
          </a>
      </div>
    </div>
  );
};