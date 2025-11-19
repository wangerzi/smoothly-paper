/**
 * 辅助面板组件
 * 显示当前段落的术语、生词、语法分析和翻译
 */

'use client';

import { useState } from 'react';
import type { ParagraphWithAnnotations } from '@/lib/db/paragraphs';
import type { EnglishLevel } from '@/types/upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AssistantPanelProps {
  paragraph: ParagraphWithAnnotations;
  userLevel: EnglishLevel;
}

export function AssistantPanel({ paragraph, userLevel }: AssistantPanelProps) {
  const { terms, difficultWords, syntaxAnalyses } = paragraph.annotations;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
        辅助面板
      </h2>

      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="terms">术语</TabsTrigger>
          <TabsTrigger value="vocabulary">生词</TabsTrigger>
          <TabsTrigger value="syntax">语法</TabsTrigger>
          <TabsTrigger value="translation">翻译</TabsTrigger>
        </TabsList>

        {/* 术语标签页 */}
        <TabsContent value="terms" className="mt-4 space-y-4">
          {terms.length === 0 ? (
            <p className="text-sm text-muted-foreground">本段暂无专业术语</p>
          ) : (
            terms.map((term, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 bg-muted/30 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="font-semibold text-primary">{term.term}</h4>
                  {term.category && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {term.category}
                    </span>
                  )}
                </div>
                {term.definition && (
                  <p className="mb-2 text-sm text-foreground">{term.definition}</p>
                )}
                {term.context && (
                  <p className="text-xs italic text-muted-foreground">
                    💡 {term.context}
                  </p>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* 生词标签页 */}
        <TabsContent value="vocabulary" className="mt-4 space-y-3">
          {difficultWords.length === 0 ? (
            <p className="text-sm text-muted-foreground">本段暂无标注生词</p>
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">
                  根据您的水平（
                  <span className="font-medium text-foreground">
                    {userLevel === 'beginner'
                      ? '初级'
                      : userLevel === 'intermediate'
                      ? '中级'
                      : '高级'}
                  </span>
                  ），为您标注了 {difficultWords.length} 个生词
                </p>
              </div>

              {difficultWords.map((word, index) => {
                const bgColor =
                  word.difficulty_level === 'easy'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : word.difficulty_level === 'medium'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-pink-500/10 border-pink-500/30';

                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${bgColor}`}
                  >
                    <div className="mb-1 flex items-baseline gap-2">
                      <h4 className="font-semibold text-foreground">{word.word}</h4>
                      {word.part_of_speech && (
                        <span className="text-xs text-muted-foreground">
                          {word.part_of_speech}
                        </span>
                      )}
                    </div>
                    {word.phonetic && (
                      <p className="mb-2 text-xs text-muted-foreground">
                        {word.phonetic}
                      </p>
                    )}
                    {word.definition && (
                      <p className="text-sm text-foreground">{word.definition}</p>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>

        {/* 语法标签页 */}
        <TabsContent value="syntax" className="mt-4 space-y-4">
          {syntaxAnalyses.length === 0 ? (
            <p className="text-sm text-muted-foreground">本段暂无复杂语法分析</p>
          ) : (
            syntaxAnalyses.map((analysis, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 bg-muted/30 p-4"
              >
                {/* 原句 */}
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    原句
                  </p>
                  <p className="text-sm italic text-foreground">
                    "{analysis.sentence}"
                  </p>
                </div>

                {/* 结构 */}
                {analysis.structure && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      结构
                    </p>
                    <p className="text-sm text-primary">{analysis.structure}</p>
                  </div>
                )}

                {/* 解释 */}
                {analysis.explanation && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      分析
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {analysis.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* 翻译标签页 */}
        <TabsContent value="translation" className="mt-4">
          {paragraph.translation ? (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {paragraph.translation}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">本段暂无翻译</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


