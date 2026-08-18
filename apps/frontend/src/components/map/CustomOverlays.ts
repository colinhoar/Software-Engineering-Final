import { useEffect, useRef, useState } from 'react';
import { useGoogleMap } from '@react-google-maps/api';
import { useLocalStorage } from '@uidotdev/usehooks';

interface CustomOverlayProps {
    bounds: google.maps.LatLngBounds;
    url: string;
    url2?: string;
    rotation: number;
    zoom: boolean;
    notLoading: boolean;
}

const CustomMapOverlay = ({ bounds, url, url2, rotation, zoom, notLoading}: CustomOverlayProps) => {
    const map = useGoogleMap();
    const overlayRef = useRef<google.maps.OverlayView | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);

        if (!map || !bounds) return;
                if(zoom && notLoading){
                    map.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 }

                    );}

                if (overlayRef.current) {

                    overlayRef.current.setMap(null);
                    overlayRef.current = null;
                }

                const overlay = new google.maps.OverlayView();

                overlay.onAdd = () => {
                    const div: HTMLDivElement = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.transform = `rotate(${rotation}deg)`;
                    div.style.transformOrigin = 'center center';
                    div.style.pointerEvents = 'none';
                    div.style.overflow = 'visible';

                    const container = document.createElement('div');
                    container.style.position = 'relative';
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.display = 'flex';
                    container.style.alignItems = 'center';
                    container.style.justifyContent = 'center';

                    const createImage = (src: string) => {
                        const img = document.createElement('img');
                        img.src = src;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.position = 'absolute';
                        return img;
                    };

                    const img1: HTMLImageElement = createImage(url);
                    container.appendChild(img1);

                    if (url2) {
                        const img2: HTMLImageElement = createImage(url2);
                        container.appendChild(img2);
                    }

                    div.appendChild(container);
                    divRef.current = div;
                    overlay.getPanes()!.mapPane.appendChild(div);
                };

                overlay.draw = () => {
                    const div = divRef.current;
                    if (!div || !overlay.getProjection()) return;

                    const projection = overlay.getProjection();
                    const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
                    const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

                    if (sw && ne) {
                        div.style.left = sw.x + 'px';
                        div.style.right = ne.x + 'px';
                        div.style.top = ne.y + 'px';
                        div.style.width = Math.abs(ne.x - sw.x) + 'px';
                        div.style.height = Math.abs(sw.y - ne.y) + 'px';
                    }
                };

                overlay.onRemove = () => {
                    if (divRef.current) {
                        divRef.current.remove();
                        divRef.current = null;
                    }
                };

                overlay.setMap(map);
                overlayRef.current = overlay;

    };

    export default CustomMapOverlay;