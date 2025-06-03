import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Clock, DollarSign, MapPin, Plus, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { DeleteTourButton } from "@/app/components/delete-tour-button";
import Image from "next/image";
import {Tour} from "@/types";
import {tourService} from "@/lib/tourService";

export default function TourList({tours}: {tours: Tour[]}) {

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Mis Tours</CardTitle>
        <Link href="/dashboard/tours/new">
          <Button className="bg-[#FF5A5F] hover:bg-[#E00007]">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tour
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Tour</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map((tour: Tour) => (
              <TableRow key={tour._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {tour.images[0] ? (
                        <Image
                          src={tour.images[0].imageUrl || "/placeholder.svg"}
                          alt={tour.title}
                          className="w-full h-full object-cover rounded-lg"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <MapPin className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {tour.title}
                      </div>
                      <div className="text-sm text-gray-500">ID: {tour._id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFE8E8] text-[#FF5A5F]">
                    {tour.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {tour.duration}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tour.location?.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {tour.price.basedOnTips ? (
                      "Basado en propinas"
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {tour.price.value}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-900">{tour.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/tours/${tour._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#FF5A5F] border-[#FFE8E8] hover:bg-[#FFE8E8] hover:text-[#E00007]"
                      >
                        Editar
                      </Button>
                    </Link>
                    <DeleteTourButton id={tour._id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
