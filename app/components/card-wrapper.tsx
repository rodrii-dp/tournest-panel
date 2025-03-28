"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/app/components/ui/card";
import {Calendar} from "lucide-react";

interface Props {
  title: string;
  content: string | number;
}

export default function CardWrapper({title, content}: Props) {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Calendar className="w-4 h-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{content}</div>
      </CardContent>
    </Card>
  )
}
